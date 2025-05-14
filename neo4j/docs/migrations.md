# Neo4j マイグレーションツール

このドキュメントでは、Neo4jデータベース用のマイグレーションツールの使用方法について説明します。

## 概要

Neo4jマイグレーションツールは、以下の機能を提供します：

- Neo4jデータベースに対する段階的なスキーマおよびデータ更新
- スキーマ操作（インデックス/制約の作成等）とデータ操作の自動分離
- 適用済みマイグレーションの追跡
- マイグレーション実行状態のJSON出力（CI/CDとの連携用）
- マイグレーション確認スクリプト（CI/CDワークフロー用）

## マイグレーションファイルの作成

マイグレーションファイルは `neo4j/migrations/` ディレクトリに配置します。マイグレーションファイルには、Cypherクエリを記述します。各クエリはセミコロン（`;`）で区切ります。

### 命名規則

マイグレーションファイルの命名規則：

- スキーマ操作用: `NNN_name_schema.cypher`（例: `003_categories_order_schema.cypher`）
- データ操作用: `MMM_name_data.cypher`（例: `004_categories_order_data.cypher`）

この命名規則を使用すると、スキーマ操作とデータ操作が完全に分離され、Neo4jのすべてのバージョンで確実に動作します。`NNN` と `MMM` は連番を表し、順序を明確にします。

### スキーマ操作とデータ操作の分離

スキーマ操作（インデックス/制約の作成等）とデータ操作（ノード/リレーションシップの作成/更新等）の分離方法：

#### 推奨方法: ファイル分割

スキーマ操作とデータ操作を別々のファイルに分割します：

1. スキーマ操作用ファイル (`*_schema.cypher`):
```cypher
// スキーマ操作のみ
CREATE INDEX IF NOT EXISTS FOR (c:Category) ON (c.order);
```

2. データ操作用ファイル (`*_data.cypher`):
```cypher
// データ操作のみ
MATCH (c:Category {name: "体"}) SET c.order = 1;
MATCH (c:Category {name: "杖"}) SET c.order = 2;
MATCH (c:Category {name: "剣"}) SET c.order = 3;
```


## マイグレーションの実行

マイグレーションを実行するには、以下のコマンドを実行します：

```bash
cd neo4j/tools
node migrate.js
```

マイグレーションが成功すると、以下のような出力が表示されます：

```
適用中: 003_categories_order
スキーマ操作が完了しました: 003_categories_order
データ操作が完了しました: 003_categories_order
成功: 003_categories_order
--- MIGRATION_STATUS_BEGIN ---
{"success":true,"migrationsApplied":["003_categories_order"],"timestamp":"2025-05-14T21:30:00.000Z"}
--- MIGRATION_STATUS_END ---
```

## CI/CDでの使用

マイグレーション確認スクリプト `verify_migration.sh` を使用すると、CI/CDワークフロー内でマイグレーションを実行し、成功/失敗を判定できます：

```bash
cd neo4j/tools
./verify_migration.sh
```

このスクリプトはマイグレーションを実行し、結果を解析します：
- マイグレーションが成功した場合、終了コード `0` を返します
- マイグレーションが失敗した場合、詳細なエラー情報を表示し、終了コード `1` を返します

また、マイグレーション結果は `neo4j/tools/migration_status.json` ファイルに保存されます。

## GitHub Actionsワークフロー

`.github/workflows/neo4j-migrations.yml` ファイルには、GitHub Actionsでマイグレーションを自動実行するワークフローの例が含まれています。このワークフローは以下のイベントでトリガーされます：

- `neo4j/migrations/` または `neo4j/tools/` ディレクトリが変更された場合のpush（main ブランチ）
- `neo4j/migrations/` または `neo4j/tools/` ディレクトリが変更された場合のプルリクエスト（main ブランチ）
- 手動トリガー
