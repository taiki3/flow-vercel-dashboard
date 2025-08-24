-- インポートされたデータを確認するクエリ

-- 各テーブルのレコード数を確認
SELECT 
  'analytics_counts' as table_name,
  COUNT(*) as record_count,
  MIN(timestamp) as earliest_data,
  MAX(timestamp) as latest_data
FROM analytics_counts

UNION ALL

SELECT 
  'analytics_speeds' as table_name,
  COUNT(*) as record_count,
  MIN(timestamp) as earliest_data,
  MAX(timestamp) as latest_data
FROM analytics_speeds

UNION ALL

SELECT 
  'parking_spaces' as table_name,
  COUNT(*) as record_count,
  MIN(timestamp) as earliest_data,
  MAX(timestamp) as latest_data
FROM parking_spaces

UNION ALL

SELECT 
  'parking_groups' as table_name,
  COUNT(*) as record_count,
  MIN(timestamp) as earliest_data,
  MAX(timestamp) as latest_data
FROM parking_groups;

-- 時間帯別のデータ数を確認（analytics_counts）
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(*) as count
FROM analytics_counts
GROUP BY hour
ORDER BY hour;

-- 最新のデータサンプル
SELECT * FROM analytics_counts ORDER BY timestamp DESC LIMIT 5;