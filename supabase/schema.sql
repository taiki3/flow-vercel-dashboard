-- Flow Post Dashboard Schema
-- This schema is designed for the Flow Post traffic monitoring system

-- Drop existing tables if they exist (for re-running this script)
DROP TABLE IF EXISTS analytics_counts CASCADE;
DROP TABLE IF EXISTS analytics_speeds CASCADE;
DROP TABLE IF EXISTS analytics_mobility CASCADE;
DROP TABLE IF EXISTS parking_groups CASCADE;
DROP TABLE IF EXISTS parking_spaces CASCADE;
DROP TABLE IF EXISTS zones CASCADE;

-- Zones definition table
CREATE TABLE zones (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('analytics', 'parking', 'group')),
  polygon TEXT, -- WKT format polygon
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics counts table (交通量データ)
CREATE TABLE analytics_counts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  analytic_id VARCHAR NOT NULL,
  label INTEGER NOT NULL, -- 1:CAR, 2:PEDESTRIAN, 3:CYCLIST, 4:MISC
  count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics speeds table (速度統計)
CREATE TABLE analytics_speeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  analytic_id VARCHAR NOT NULL,
  label INTEGER NOT NULL,
  max_speed DOUBLE PRECISION,
  mean_speed DOUBLE PRECISION,
  v85_speed DOUBLE PRECISION, -- 85パーセンタイル速度
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics mobility table (移動性指標)
CREATE TABLE analytics_mobility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  analytic_id VARCHAR NOT NULL,
  label INTEGER NOT NULL,
  density_max DOUBLE PRECISION,
  density_mean DOUBLE PRECISION,
  occupancy_rate_max DOUBLE PRECISION,
  occupancy_rate_mean DOUBLE PRECISION,
  stay_time_max DOUBLE PRECISION,
  stay_time_mean DOUBLE PRECISION,
  flow_rate_max DOUBLE PRECISION,
  flow_rate_mean DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parking groups table (駐車場グループ)
CREATE TABLE parking_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  group_zone_id VARCHAR NOT NULL,
  occupied_zone_ids TEXT[], -- Array of occupied zone IDs
  available_zone_ids TEXT[], -- Array of available zone IDs
  occupied_zones INTEGER DEFAULT 0,
  available_zones INTEGER DEFAULT 0,
  last_24h_cumulative_occupied_duration BIGINT,
  last_24h_max_occupied_duration BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parking spaces table (個別駐車スペース)
CREATE TABLE parking_spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  zone_id VARCHAR NOT NULL,
  occupied BOOLEAN DEFAULT false,
  parked_label INTEGER, -- Vehicle type if occupied
  is_real_occupied_transition BOOLEAN DEFAULT false,
  last_occupied_state_transition_time TIMESTAMPTZ,
  occupied_state_duration BIGINT,
  last_24h_cumulative_occupied_duration BIGINT,
  last_24h_max_occupied_duration BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_analytics_counts_timestamp ON analytics_counts(timestamp DESC);
CREATE INDEX idx_analytics_counts_analytic_id ON analytics_counts(analytic_id);
CREATE INDEX idx_analytics_speeds_timestamp ON analytics_speeds(timestamp DESC);
CREATE INDEX idx_analytics_speeds_analytic_id ON analytics_speeds(analytic_id);
CREATE INDEX idx_analytics_mobility_timestamp ON analytics_mobility(timestamp DESC);
CREATE INDEX idx_parking_groups_timestamp ON parking_groups(timestamp DESC);
CREATE INDEX idx_parking_groups_group_zone_id ON parking_groups(group_zone_id);
CREATE INDEX idx_parking_spaces_timestamp ON parking_spaces(timestamp DESC);
CREATE INDEX idx_parking_spaces_zone_id ON parking_spaces(zone_id);

-- Enable Row Level Security
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_speeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_mobility ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spaces ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous read access
CREATE POLICY "Allow anonymous read access" ON zones
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON analytics_counts
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON analytics_speeds
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON analytics_mobility
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON parking_groups
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON parking_spaces
  FOR SELECT USING (true);

-- Create views for dashboard
CREATE OR REPLACE VIEW current_traffic_summary AS
SELECT 
  timestamp,
  SUM(CASE WHEN label = 1 THEN count ELSE 0 END) as car_count,
  SUM(CASE WHEN label = 2 THEN count ELSE 0 END) as pedestrian_count,
  SUM(CASE WHEN label = 3 THEN count ELSE 0 END) as cyclist_count,
  SUM(CASE WHEN label = 4 THEN count ELSE 0 END) as misc_count,
  SUM(count) as total_count
FROM analytics_counts
WHERE timestamp = (SELECT MAX(timestamp) FROM analytics_counts)
GROUP BY timestamp;

CREATE OR REPLACE VIEW current_parking_summary AS
SELECT 
  timestamp,
  COUNT(CASE WHEN occupied = true THEN 1 END) as occupied_spaces,
  COUNT(CASE WHEN occupied = false THEN 1 END) as available_spaces,
  ROUND(COUNT(CASE WHEN occupied = true THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as occupancy_rate
FROM parking_spaces
WHERE timestamp = (SELECT MAX(timestamp) FROM parking_spaces)
GROUP BY timestamp;

-- Function to get traffic trends
CREATE OR REPLACE FUNCTION get_traffic_trends(hours INTEGER DEFAULT 24)
RETURNS TABLE (
  data_timestamp TIMESTAMPTZ,
  car_count BIGINT,
  pedestrian_count BIGINT,
  cyclist_count BIGINT,
  misc_count BIGINT,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.timestamp AS data_timestamp,
    SUM(CASE WHEN ac.label = 1 THEN ac.count ELSE 0 END) as car_count,
    SUM(CASE WHEN ac.label = 2 THEN ac.count ELSE 0 END) as pedestrian_count,
    SUM(CASE WHEN ac.label = 3 THEN ac.count ELSE 0 END) as cyclist_count,
    SUM(CASE WHEN ac.label = 4 THEN ac.count ELSE 0 END) as misc_count,
    SUM(ac.count) as total_count
  FROM analytics_counts ac
  WHERE ac.timestamp >= NOW() - INTERVAL '1 hour' * hours
  GROUP BY ac.timestamp
  ORDER BY ac.timestamp ASC;
END;
$$ LANGUAGE plpgsql;