import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug: Log if environment variables are not set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase環境変数が設定されていません。.envファイルを確認してください。');
  console.warn('必要な環境変数: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Label types for objects
export enum ObjectLabel {
  CAR = 1,
  PEDESTRIAN = 2,
  CYCLIST = 3,
  MISC = 4
}

// Zone types
export type ZoneType = 'analytics' | 'parking' | 'group';

// Database types based on actual data structure
export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  polygon?: string; // WKT format
  created_at?: string;
}

export interface AnalyticsCount {
  id?: string;
  timestamp: string;
  analytic_id: string;
  label: ObjectLabel;
  count: number;
  created_at?: string;
}

export interface AnalyticsSpeed {
  id?: string;
  timestamp: string;
  analytic_id: string;
  label: ObjectLabel;
  max_speed: number;
  mean_speed: number;
  v85_speed: number; // 85th percentile
  created_at?: string;
}

export interface AnalyticsMobility {
  id?: string;
  timestamp: string;
  analytic_id: string;
  label: ObjectLabel;
  density_max: number;
  density_mean: number;
  occupancy_rate_max: number;
  occupancy_rate_mean: number;
  stay_time_max: number;
  stay_time_mean: number;
  flow_rate_max: number;
  flow_rate_mean: number;
  created_at?: string;
}

export interface ParkingGroup {
  id?: string;
  timestamp: string;
  group_zone_id: string;
  occupied_zone_ids: string[];
  available_zone_ids: string[];
  occupied_zones: number;
  available_zones: number;
  last_24h_cumulative_occupied_duration?: number;
  last_24h_max_occupied_duration?: number;
  created_at?: string;
}

export interface ParkingSpace {
  id?: string;
  timestamp: string;
  zone_id: string;
  occupied: boolean;
  parked_label?: ObjectLabel;
  is_real_occupied_transition?: boolean;
  last_occupied_state_transition_time?: string;
  occupied_state_duration?: number;
  last_24h_cumulative_occupied_duration?: number;
  last_24h_max_occupied_duration?: number;
  created_at?: string;
}

// Summary views
export interface TrafficSummary {
  timestamp: string;
  car_count: number;
  pedestrian_count: number;
  cyclist_count: number;
  misc_count: number;
  total_count: number;
}

export interface ParkingSummary {
  timestamp: string;
  occupied_spaces: number;
  available_spaces: number;
  occupancy_rate: number;
}

// Helper function to get label name
export function getLabelName(label: ObjectLabel): string {
  switch (label) {
    case ObjectLabel.CAR:
      return '車両';
    case ObjectLabel.PEDESTRIAN:
      return '歩行者';
    case ObjectLabel.CYCLIST:
      return '自転車';
    case ObjectLabel.MISC:
      return 'その他';
    default:
      return '不明';
  }
}

// Helper function to calculate congestion rate based on traffic density
export function calculateCongestionRate(density: number, maxDensity: number = 100): number {
  return Math.min(100, (density / maxDensity) * 100);
}