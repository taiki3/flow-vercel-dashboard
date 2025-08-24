-- INSERT権限を追加するポリシー
-- これにより、anonユーザーでもデータをインポートできるようになります

-- Analytics Counts
CREATE POLICY "Allow anonymous insert" ON analytics_counts
  FOR INSERT WITH CHECK (true);

-- Analytics Speeds  
CREATE POLICY "Allow anonymous insert" ON analytics_speeds
  FOR INSERT WITH CHECK (true);

-- Analytics Mobility
CREATE POLICY "Allow anonymous insert" ON analytics_mobility
  FOR INSERT WITH CHECK (true);

-- Parking Spaces
CREATE POLICY "Allow anonymous insert" ON parking_spaces
  FOR INSERT WITH CHECK (true);

-- Parking Groups
CREATE POLICY "Allow anonymous insert" ON parking_groups
  FOR INSERT WITH CHECK (true);

-- Zones
CREATE POLICY "Allow anonymous insert" ON zones
  FOR INSERT WITH CHECK (true);

-- 注意: 本番環境では、より厳密なポリシーを設定してください
-- 例: サービスロールキーを使用するか、特定の条件でのみINSERTを許可する