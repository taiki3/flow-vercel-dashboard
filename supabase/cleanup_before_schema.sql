-- このファイルを最初に実行して、既存のオブジェクトをクリーンアップしてください
-- Run this file first to clean up existing objects before applying the new schema

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_latest_traffic_data() CASCADE;
DROP FUNCTION IF EXISTS get_traffic_trends(INTEGER) CASCADE;

-- Drop existing views if they exist
DROP VIEW IF EXISTS current_traffic_summary CASCADE;
DROP VIEW IF EXISTS current_parking_summary CASCADE;

-- これを実行した後、schema.sql を実行してください
-- After running this, execute schema.sql