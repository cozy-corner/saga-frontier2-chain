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

      // マイグレーションの実行
      const execSession = driver.session({
        database: config.neo4j.database
      });

      try {
        // セミコロンで区切られた複数のステートメントを実行
        const statements = cypherScript
          .split(';')
          .map(s => s.trim())
          .filter(s => s);

        // トランザクションを開始
        const txc = execSession.beginTransaction();
        try {
          // 各ステートメントをトランザクション内で実行
          for (const statement of statements) {
            await txc.run(statement);
          }

          // 成功したマイグレーションを記録（同じトランザクション内）
          await txc.run(`
            MATCH (m:_Migrations {id: "migration_tracker"})
            SET m.last_migration = $migrationId,
                m.applied_migrations = CASE
                  WHEN m.applied_migrations IS NULL THEN [$migrationId]
                  ELSE m.applied_migrations + $migrationId
                END,
                m.last_migration_date = datetime()
          `, { migrationId });

          // トランザクションをコミット
          await txc.commit();
          console.log(`成功: ${migrationId}`);
        } catch (error) {
          // エラー発生時はトランザクションをロールバック
          await txc.rollback();
          throw error;
        }
      } catch (error) {
        console.error(`エラー (${migrationId}): ${error.message}`);
        throw error;
      } finally {
        await execSession.close();
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
