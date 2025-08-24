# 交通監視ダッシュボード

リアルタイムで交通データを監視・可視化するダッシュボードアプリケーション

## 機能

- 📊 **リアルタイムデータ表示**
  - 交通量
  - 混雑率（％）
  - 駐車場利用率
  - 違法駐車台数

- 🗺️ **駐車状況マップビュー**
  - 衛星写真上に車両をボックス表示
  - 15分単位のデータを5倍速でループ再生
  - 車両サイズ別の色分け表示

- 📈 **トレンドグラフ**
  - 24時間の推移グラフ
  - 統計サマリー表示

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **スタイリング**: Tailwind CSS + Shadcn/ui
- **データベース**: Supabase (PostgreSQL)
- **地図表示**: Leaflet + React Leaflet
- **グラフ**: Recharts
- **デプロイ**: Vercel

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. SQLエディタで`supabase/schema.sql`の内容を実行
4. プロジェクトのURL とAnon Keyを取得

### 2. 環境変数の設定

`.env`ファイルを作成し、以下を設定：

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

## Vercelへのデプロイ

### 1. GitHubリポジトリの作成

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### 2. Vercelでのデプロイ

1. [Vercel](https://vercel.com)にログイン
2. "New Project"をクリック
3. GitHubリポジトリをインポート
4. 環境変数を設定：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. "Deploy"をクリック

### 3. デプロイ後の設定

Supabaseダッシュボードで以下を確認：
- Row Level Security (RLS)が有効になっていること
- 必要に応じてCORSの設定を調整

## データの投入

### 実データのインポート（Flow Postデータ）

Flow Postの実際のダミーデータをインポートする場合：

1. 既存のテーブルを確認（オプション）：
```sql
-- Supabase SQLエディタで実行して既存データを確認
-- supabase/check_existing_tables.sql の内容を実行
```

2. 新しいスキーマを適用：
```sql
-- Supabase SQLエディタで supabase/schema_v2.sql を実行
-- 注意: このスクリプトは既存のテーブル（traffic_data, parking_data, parking_chunks）には
-- 影響しません。新しいテーブルのみを作成します。
```

3. データをインポート：
```bash
npm run import-data
```

このスクリプトは以下のデータをインポートします：
- Analytics Counts（交通量カウント）
- Analytics Speeds（速度統計）
- Parking Spaces（個別駐車スペース）
- Parking Groups（駐車場グループ）

### サンプルデータの生成（旧版）

旧バージョンのサンプルデータを生成する場合は、ブラウザのコンソールで以下を実行：

```javascript
// src/utils/generateSampleData.ts の関数を使用
await initializeSampleData();
```

## プロジェクト構造

```
src/
├── components/       # UIコンポーネント
│   ├── TrafficOverview.tsx    # 交通データ概要
│   ├── ParkingMapView.tsx     # 駐車場マップビュー
│   └── TrafficTrends.tsx      # トレンドグラフ
├── hooks/           # カスタムフック
│   └── useTrafficData.ts      # データ取得フック
├── lib/             # ライブラリ設定
│   ├── supabase.ts            # Supabaseクライアント（旧版）
│   └── supabase-v2.ts         # Supabaseクライアント（Flow Post対応）
└── utils/           # ユーティリティ
    └── generateSampleData.ts  # サンプルデータ生成

scripts/
└── import-data.ts   # Flow Postデータインポートスクリプト

supabase/
├── schema.sql       # データベーススキーマ（旧版）
└── schema_v2.sql    # データベーススキーマ（Flow Post対応）
```

## ライセンス

MIT