import { useState, useEffect } from 'react';
import { supabase, TrafficData, ParkingChunk } from '../lib/supabase';

export function useTrafficData() {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [trends, setTrends] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestData();
    fetchTrends();

    // Set up real-time subscription
    const subscription = supabase
      .channel('traffic_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'traffic_data'
        },
        (payload) => {
          setTrafficData(payload.new as TrafficData);
          fetchTrends(); // Refresh trends when new data arrives
        }
      )
      .subscribe();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchLatestData();
      fetchTrends();
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchLatestData = async () => {
    try {
      const { data, error } = await supabase
        .from('traffic_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle instead of single to handle empty table

      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
      
      // If no data, use default values
      if (!data) {
        setTrafficData({
          timestamp: new Date().toISOString(),
          traffic_volume: 0,
          congestion_rate: 0,
          parking_utilization: 0,
          illegal_parking_count: 0
        });
      } else {
        setTrafficData(data);
      }
    } catch (err) {
      console.error('Error fetching latest data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch traffic data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const { data, error } = await supabase
        .from('traffic_data')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: true });

      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
      setTrends(data || []);
    } catch (err) {
      console.error('Error fetching trends:', err);
      // Don't set error for trends, just use empty array
      setTrends([]);
    }
  };

  return { trafficData, trends, loading, error };
}

export function useParkingData() {
  const [currentChunk, setCurrentChunk] = useState<ParkingChunk | null>(null);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLatestChunk();

    // Set up real-time subscription for new parking chunks
    const subscription = supabase
      .channel('parking_chunks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'parking_chunks'
        },
        (payload) => {
          setCurrentChunk(payload.new as ParkingChunk);
          setPlaybackIndex(0);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || !currentChunk) return;

    // Playback at 5x speed (3 seconds for 15 minutes of data)
    const playbackInterval = setInterval(() => {
      setPlaybackIndex((prev) => {
        if (prev >= 14) return 0; // Loop back to start
        return prev + 1;
      });
    }, 200); // 3000ms / 15 = 200ms per minute

    return () => clearInterval(playbackInterval);
  }, [isPlaying, currentChunk]);

  const fetchLatestChunk = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_chunks')
        .select('*')
        .order('chunk_timestamp', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle to handle empty table

      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
      
      // If no data, create sample data
      if (!data) {
        const sampleChunk = {
          chunk_timestamp: new Date().toISOString(),
          parking_data: []
        };
        setCurrentChunk(sampleChunk);
      } else {
        setCurrentChunk(data);
      }
    } catch (err) {
      console.error('Error fetching parking data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch parking data');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => setIsPlaying(!isPlaying);

  return {
    currentChunk,
    playbackIndex,
    isPlaying,
    togglePlayback,
    loading,
    error
  };
}