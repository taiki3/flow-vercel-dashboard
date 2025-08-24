# Flow Post 交通監視ダッシュボード

リアルタイムで交通データを監視・可視化するFlow Post対応ダッシュボードアプリケーション

## 概要

Flow Postシステムから収集された交通データを可視化するダッシュボードです。車両、歩行者、自転車の検出データと駐車場の利用状況をリアルタイムで表示します。

## 機能

- 📊 **リアルタイムデータ表示**
  - 車両カウント
  - 歩行者カウント
  - 自転車カウント
  - その他オブジェクトカウント
  - 駐車場利用率

- 📈 **トレンドグラフ**
  - 24時間の推移グラフ
  - オブジェクトタイプ別の統計
  - 時系列分析

- 🅿️ **駐車場管理**
  - 個別駐車スペースの状態
  - 駐車場グループの占有率
  - 利用時間統計

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **スタイリング**: Tailwind CSS + Shadcn/ui
- **データベース**: Supabase (PostgreSQL)
- **グラフ**: Recharts
- **データ処理**: DuckDB (Parquetファイル処理)
- **デプロイ**: Vercel

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. SQLエディタで`supabase/schema.sql`の内容を実行
4. プロジェクトのURLとAnon Keyを取得

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

## データのインポート

Flow Postのダミーデータをインポートする場合：

```bash
# データインポートスクリプトの実行
npm run import-data
```

このスクリプトは以下のデータをインポートします：
- Analytics Counts（交通量カウント）
- Analytics Speeds（速度統計）
- Analytics Mobility（移動性指標）
- Parking Spaces（個別駐車スペース）
- Parking Groups（駐車場グループ）

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

## データ構造

### オブジェクトラベル
- 1: CAR（車両）
- 2: PEDESTRIAN（歩行者）
- 3: CYCLIST（自転車）
- 4: MISC（その他）

### 主要テーブル
- `analytics_counts`: 交通量カウントデータ
- `analytics_speeds`: 速度統計データ
- `analytics_mobility`: 移動性指標データ
- `parking_spaces`: 個別駐車スペース状態
- `parking_groups`: 駐車場グループ管理
- `zones`: ゾーン定義

## プロジェクト構造

```
src/
├── components/       # UIコンポーネント
│   ├── TrafficOverviewV2.tsx  # Flow Post対応交通データ概要
│   ├── TrafficTrends.tsx      # トレンドグラフ
│   └── TrafficNavigation.tsx  # ナビゲーション
├── hooks/           # カスタムフック
│   └── useFlowPostData.ts    # Flow Postデータ取得フック
├── lib/             # ライブラリ設定
│   └── supabase.ts           # Supabaseクライアント
└── App.tsx          # メインアプリケーション

scripts/
└── import-data.ts   # データインポートスクリプト

supabase/
└── schema.sql       # データベーススキーマ
```

## ライセンス

MIT