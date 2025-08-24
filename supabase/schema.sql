-- Create traffic_data table
CREATE TABLE IF NOT EXISTS traffic_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  traffic_volume INTEGER NOT NULL,
  congestion_rate DECIMAL(5,2) NOT NULL CHECK (congestion_rate >= 0 AND congestion_rate <= 100),
  parking_utilization DECIMAL(5,2) NOT NULL CHECK (parking_utilization >= 0 AND parking_utilization <= 100),
  illegal_parking_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create parking_data table
CREATE TABLE IF NOT EXISTS parking_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  vehicle_type VARCHAR(10) NOT NULL CHECK (vehicle_type IN ('small', 'medium', 'large')),
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create parking_chunks table for 15-minute intervals
CREATE TABLE IF NOT EXISTS parking_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chunk_timestamp TIMESTAMPTZ NOT NULL,
  parking_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_traffic_data_timestamp ON traffic_data(timestamp DESC);
CREATE INDEX idx_parking_data_timestamp ON parking_data(timestamp DESC);
CREATE INDEX idx_parking_chunks_timestamp ON parking_chunks(chunk_timestamp DESC);

-- Enable Row Level Security
ALTER TABLE traffic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_chunks ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous read access
CREATE POLICY "Allow anonymous read access" ON traffic_data
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON parking_data
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON parking_chunks
  FOR SELECT USING (true);

-- Create a function to get latest traffic data
CREATE OR REPLACE FUNCTION get_latest_traffic_data()
RETURNS TABLE (
  data_timestamp TIMESTAMPTZ,
  traffic_volume INTEGER,
  congestion_rate DECIMAL,
  parking_utilization DECIMAL,
  illegal_parking_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.timestamp AS data_timestamp,
    t.traffic_volume,
    t.congestion_rate,
    t.parking_utilization,
    t.illegal_parking_count
  FROM traffic_data t
  ORDER BY t.timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get traffic trends for the last 24 hours
CREATE OR REPLACE FUNCTION get_traffic_trends(hours INTEGER DEFAULT 24)
RETURNS TABLE (
  data_timestamp TIMESTAMPTZ,
  traffic_volume INTEGER,
  congestion_rate DECIMAL,
  parking_utilization DECIMAL,
  illegal_parking_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.timestamp AS data_timestamp,
    t.traffic_volume,
    t.congestion_rate,
    t.parking_utilization,
    t.illegal_parking_count
  FROM traffic_data t
  WHERE t.timestamp >= NOW() - INTERVAL '1 hour' * hours
  ORDER BY t.timestamp ASC;
END;
$$ LANGUAGE plpgsql;