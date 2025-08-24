-- 既存のテーブルを確認するクエリ
-- このクエリを実行して、現在のテーブル構造を確認してください

-- 現在のテーブル一覧を表示
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 各テーブルのレコード数を確認
SELECT 
  'traffic_data' as table_name, 
  COUNT(*) as record_count 
FROM traffic_data
UNION ALL
SELECT 
  'parking_data' as table_name, 
  COUNT(*) as record_count 
FROM parking_data
UNION ALL
SELECT 
  'parking_chunks' as table_name, 
  COUNT(*) as record_count 
FROM parking_chunks;