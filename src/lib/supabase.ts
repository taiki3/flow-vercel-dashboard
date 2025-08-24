import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface TrafficData {
  id?: string;
  timestamp: string;
  traffic_volume: number;
  congestion_rate: number;
  parking_utilization: number;
  illegal_parking_count: number;
  created_at?: string;
}

export interface ParkingData {
  id?: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  vehicle_type: 'small' | 'medium' | 'large';
  duration_minutes?: number;
  created_at?: string;
}

export interface ParkingChunk {
  id?: string;
  chunk_timestamp: string;
  parking_data: ParkingData[];
  created_at?: string;
}