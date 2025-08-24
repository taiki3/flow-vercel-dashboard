import { useState, useEffect } from 'react';
import { supabase, TrafficSummary, ParkingSummary, AnalyticsCount, ParkingSpace } from '../lib/supabase';

export function useTrafficSummary() {
  const [summary, setSummary] = useState<TrafficSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();

    // Set up real-time subscription
    const subscription = supabase
      .channel('traffic_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_counts'
        },
        () => {
          fetchSummary();
        }
      )
      .subscribe();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchSummary();
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchSummary = async () => {
    try {
      // Get latest timestamp
      const { data: latestData, error: timeError } = await supabase
        .from('analytics_counts')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (timeError || !latestData) {
        setSummary({
          timestamp: new Date().toISOString(),
          car_count: 0,
          pedestrian_count: 0,
          cyclist_count: 0,
          misc_count: 0,
          total_count: 0
        });
        return;
      }

      // Get counts for latest timestamp grouped by label
      const { data: counts, error: countError } = await supabase
        .from('analytics_counts')
        .select('label, count')
        .eq('timestamp', latestData.timestamp);

      if (countError) throw countError;

      // Aggregate counts by label
      const summary: TrafficSummary = {
        timestamp: latestData.timestamp,
        car_count: 0,
        pedestrian_count: 0,
        cyclist_count: 0,
        misc_count: 0,
        total_count: 0
      };

      counts?.forEach(item => {
        const count = item.count || 0;
        switch (item.label) {
          case 1: // CAR
            summary.car_count += count;
            break;
          case 2: // PEDESTRIAN
            summary.pedestrian_count += count;
            break;
          case 3: // CYCLIST
            summary.cyclist_count += count;
            break;
          case 4: // MISC
            summary.misc_count += count;
            break;
        }
        summary.total_count += count;
      });

      setSummary(summary);
    } catch (err) {
      console.error('Error fetching traffic summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch traffic summary');
    } finally {
      setLoading(false);
    }
  };

  return { summary, loading, error };
}

export function useParkingSummary() {
  const [summary, setSummary] = useState<ParkingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();

    // Set up real-time subscription
    const subscription = supabase
      .channel('parking_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parking_spaces'
        },
        () => {
          fetchSummary();
        }
      )
      .subscribe();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchSummary();
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchSummary = async () => {
    try {
      // Get latest timestamp
      const { data: latestData, error: timeError } = await supabase
        .from('parking_spaces')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (timeError || !latestData) {
        setSummary({
          timestamp: new Date().toISOString(),
          occupied_spaces: 0,
          available_spaces: 0,
          occupancy_rate: 0
        });
        return;
      }

      // Get parking status for latest timestamp
      const { data: spaces, error: spaceError } = await supabase
        .from('parking_spaces')
        .select('occupied')
        .eq('timestamp', latestData.timestamp);

      if (spaceError) throw spaceError;

      const occupied = spaces?.filter(s => s.occupied).length || 0;
      const total = spaces?.length || 1; // Avoid division by zero
      const available = total - occupied;

      setSummary({
        timestamp: latestData.timestamp,
        occupied_spaces: occupied,
        available_spaces: available,
        occupancy_rate: Math.round((occupied / total) * 100)
      });
    } catch (err) {
      console.error('Error fetching parking summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch parking summary');
    } finally {
      setLoading(false);
    }
  };

  return { summary, loading, error };
}

export function useTrafficTrends(hours: number = 24) {
  const [trends, setTrends] = useState<TrafficSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrends();

    const interval = setInterval(() => {
      fetchTrends();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [hours]);

  const fetchTrends = async () => {
    try {
      // データが2025年7月28日のものなので、すべてのデータを取得
      console.log('Fetching all trends data');
      
      const { data, error } = await supabase
        .from('analytics_counts')
        .select('timestamp, label, count')
        .order('timestamp', { ascending: true });

      console.log('Supabase response - error:', error, 'data length:', data?.length);
      
      if (error) throw error;

      // Group by timestamp
      const grouped = new Map<string, TrafficSummary>();
      
      data?.forEach(item => {
        const key = item.timestamp;
        if (!grouped.has(key)) {
          grouped.set(key, {
            timestamp: key,
            car_count: 0,
            pedestrian_count: 0,
            cyclist_count: 0,
            misc_count: 0,
            total_count: 0
          });
        }
        
        const summary = grouped.get(key)!;
        const count = item.count || 0;
        
        switch (item.label) {
          case 1: summary.car_count += count; break;
          case 2: summary.pedestrian_count += count; break;
          case 3: summary.cyclist_count += count; break;
          case 4: summary.misc_count += count; break;
        }
        summary.total_count += count;
      });

      const trendsArray = Array.from(grouped.values());
      console.log('Fetched trends:', trendsArray.length, 'data points');
      setTrends(trendsArray);
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trends');
    } finally {
      setLoading(false);
    }
  };

  return { trends, loading, error };
}

export function useParkingSpaces() {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSpaces();

    const subscription = supabase
      .channel('parking_spaces_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parking_spaces'
        },
        () => {
          fetchSpaces();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchSpaces();
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchSpaces = async () => {
    try {
      // Get latest timestamp
      const { data: latestData, error: timeError } = await supabase
        .from('parking_spaces')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (timeError || !latestData) {
        setSpaces([]);
        return;
      }

      // Get all parking spaces for latest timestamp
      const { data, error } = await supabase
        .from('parking_spaces')
        .select('*')
        .eq('timestamp', latestData.timestamp)
        .order('zone_id');

      if (error) throw error;
      setSpaces(data || []);
    } catch (err) {
      console.error('Error fetching parking spaces:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch parking spaces');
    } finally {
      setLoading(false);
    }
  };

  return { spaces, loading, error };
}