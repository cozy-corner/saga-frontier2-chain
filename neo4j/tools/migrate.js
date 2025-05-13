#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const neo4j = require('neo4j-driver');

// 設定（環境変数から取得または既定値を使用）
const config = {
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password',
    database: process.env.NEO4J_DATABASE || 'neo4j'
  },
  migrationsDir: process.env.MIGRATIONS_DIR || path.join(__dirname, '../migrations'),
  retryAttempts: 5,
  retryDelay: 2000
};

// 接続リトライ関数
async function connectWithRetry() {
  let attempts = 0;
  let driver;

  while (attempts < config.retryAttempts) {
    try {
      driver = neo4j.driver(
        config.neo4j.uri,
        neo4j.auth.basic(config.neo4j.user, config.neo4j.password)
      );
      
      // 接続テスト
      const session = driver.session();
      await session.run('RETURN 1');
      await session.close();
      
      console.log('Neo4jへの接続に成功しました');
      return driver;
    } catch (error) {
      // Always dispose the driver before retrying
      try {
        await driver?.close();
      } catch (_) {
        /* noop – best-effort cleanup */
      }
      
      attempts++;
      console.log(`Neo4jへの接続に失敗しました (${attempts}/${config.retryAttempts}): ${error.message}`);
      
      if (attempts >= config.retryAttempts) {
        throw new Error(`Neo4jへの接続が${config.retryAttempts}回試行後も失敗しました`);
      }
      
      // 次の試行前に待機
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
    }
  }
}

// マイグレーションの実行
async function runMigrations() {
  let driver;
  
  try {
    // リトライロジックを使用して接続
    driver = await connectWithRetry();
    
    // 適用済みマイグレーションの管理用ノード作成
    const session = driver.session({ database: config.neo4j.database });
    try {
      await session.run(`
        MERGE (m:_Migrations {id: "migration_tracker"})
        RETURN m
      `);
    } finally {
      await session.close();
    }

    // 適用済みマイグレーションの取得
    const trackSession = driver.session({ database: config.neo4j.database });
    let appliedMigrations = [];
    try {
      const result = await trackSession.run(`
        MATCH (m:_Migrations {id: "migration_tracker"})
        RETURN m.applied_migrations as applied
      `);
      if (result.records.length > 0 && result.records[0].get('applied')) {
        appliedMigrations = result.records[0].get('applied');
      }
    } finally {
      await trackSession.close();
    }

    console.log(`適用済みマイグレーション: ${appliedMigrations.join(', ') || 'なし'}`);

    // マイグレーションファイルの取得とソート
    const migrationFiles = fs.readdirSync(config.migrationsDir)
      .filter(file => file.endsWith('.cypher'))
      .sort(); // ファイル名でソート（001_xxx.cypher, 002_xxx.cypher の順）

    // 未適用のマイグレーションを実行（差分のみ）
    let migrationsRun = 0;
    for (const file of migrationFiles) {
      const migrationId = path.basename(file, '.cypher');

      if (appliedMigrations.includes(migrationId)) {
        console.log(`スキップ: ${migrationId} (既に適用済み)`);
        continue;
      }

      migrationsRun++;
      console.log(`適用中: ${migrationId}`);

      // Cypherスクリプトを読み込み
      const cypherScript = fs.readFileSync(
        path.join(config.migrationsDir, file),
        'utf8'
      );

      // セミコロンで区切られた複数のステートメントを準備
      // TODO, nits: セミコロンがCypherの一部として使用されている場合の処理
      const statements = cypherScript
        .split(';')
        .map(s => s.trim())
        .filter(s => s);

      // スキーマ操作とデータ操作を分離（正規表現を使用して正確にマッチング）
      const schemaPattern = /^\s*(CREATE|DROP)\s+(INDEX|CONSTRAINT)\b/i;
      const schemaStatements = statements.filter(stmt => schemaPattern.test(stmt));
      const dataStatements = statements.filter(stmt => !schemaPattern.test(stmt));

      try {
        // 1. スキーマ操作を実行（存在する場合）
        if (schemaStatements.length > 0) {
          const schemaSession = driver.session({ database: config.neo4j.database });
          try {
            for (const statement of schemaStatements) {
              await schemaSession.run(statement);
            }
            console.log(`スキーマ操作が完了しました: ${migrationId}`);
          } finally {
            await schemaSession.close();
          }
        }
        
        // 2. データ操作を実行（存在する場合）
        if (dataStatements.length > 0) {
          const dataSession = driver.session({ database: config.neo4j.database });
          try {
            const dataTxc = dataSession.beginTransaction();
            try {
              for (const statement of dataStatements) {
                await dataTxc.run(statement);
              }
              await dataTxc.commit();
              console.log(`データ操作が完了しました: ${migrationId}`);
            } catch (error) {
              await dataTxc.rollback();
              throw error;
            }
          } finally {
            await dataSession.close();
          }
        }
        
        // 3. マイグレーション情報を更新
        const updateSession = driver.session({ database: config.neo4j.database });
        try {
          const updateTxc = updateSession.beginTransaction();
          try {
            await updateTxc.run(`
              MATCH (m:_Migrations {id: "migration_tracker"})
              SET m.last_migration = $migrationId,
                  m.applied_migrations = CASE
                    WHEN m.applied_migrations IS NULL THEN [$migrationId]
                    ELSE m.applied_migrations + $migrationId
                  END,
                  m.last_migration_date = datetime()
            `, { migrationId });
            await updateTxc.commit();
          } catch (error) {
            await updateTxc.rollback();
            throw error;
          }
        } finally {
          await updateSession.close();
        }
        
        console.log(`成功: ${migrationId}`);
        
      } catch (error) {
        console.error(`エラー (${migrationId}): ${error.message}`);
        throw error;
      }
    }

    if (migrationsRun === 0) {
      console.log('新規マイグレーションはありませんでした');
    } else {
      console.log(`${migrationsRun}個のマイグレーションが適用されました`);
    }
  } catch (error) {
    console.error(`マイグレーション中にエラーが発生しました: ${error.message}`);
    process.exit(1);
  } finally {
    if (driver) {
      await driver.close();
    }
  }
}

// スクリプトが実行された場合
runMigrations().catch(err => {
  console.error(err);
  process.exit(1);
});
