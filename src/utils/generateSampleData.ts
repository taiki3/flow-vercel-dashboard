import { supabase } from '../lib/supabase';
import type { TrafficData, ParkingData } from '../lib/supabase';

// Generate sample traffic data
export async function generateSampleTrafficData() {
  const now = new Date();
  const data: TrafficData[] = [];

  // Generate 24 hours of data
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    
    // Simulate traffic patterns based on time of day
    const baseTraffic = 1000;
    const rushHourMultiplier = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 2 : 1;
    const nightMultiplier = hour >= 22 || hour <= 5 ? 0.3 : 1;
    
    data.push({
      timestamp: timestamp.toISOString(),
      traffic_volume: Math.floor(baseTraffic * rushHourMultiplier * nightMultiplier + Math.random() * 200),
      congestion_rate: Math.min(100, Math.floor(30 * rushHourMultiplier * nightMultiplier + Math.random() * 20)),
      parking_utilization: Math.min(100, Math.floor(60 + Math.random() * 30)),
      illegal_parking_count: Math.floor(Math.random() * 10 * rushHourMultiplier)
    });
  }

  const { error } = await supabase
    .from('traffic_data')
    .insert(data);

  if (error) {
    console.error('Error inserting traffic data:', error);
    return false;
  }

  console.log('Sample traffic data generated successfully');
  return true;
}

// Generate sample parking data chunks
export async function generateSampleParkingData() {
  const now = new Date();
  const chunks = [];

  // Generate last 3 chunks (45 minutes of data)
  for (let chunkIdx = 2; chunkIdx >= 0; chunkIdx--) {
    const chunkTime = new Date(now.getTime() - chunkIdx * 15 * 60 * 1000);
    const parkingData: ParkingData[] = [];

    // Generate data for each minute in the 15-minute chunk
    for (let minute = 0; minute < 15; minute++) {
      const minuteTime = new Date(chunkTime.getTime() + minute * 60 * 1000);
      
      // Generate 20-50 random vehicles
      const vehicleCount = 20 + Math.floor(Math.random() * 30);
      
      for (let v = 0; v < vehicleCount; v++) {
        // Center around Tokyo Station with some spread
        const lat = 35.6812 + (Math.random() - 0.5) * 0.01;
        const lng = 139.7671 + (Math.random() - 0.5) * 0.01;
        
        // Random vehicle type
        const types: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
        const vehicleType = types[Math.floor(Math.random() * types.length)];
        
        parkingData.push({
          timestamp: minuteTime.toISOString(),
          latitude: lat,
          longitude: lng,
          vehicle_type: vehicleType,
          duration_minutes: Math.floor(Math.random() * 120) // 0-120 minutes
        });
      }
    }

    chunks.push({
      chunk_timestamp: chunkTime.toISOString(),
      parking_data: parkingData
    });
  }

  const { error } = await supabase
    .from('parking_chunks')
    .insert(chunks);

  if (error) {
    console.error('Error inserting parking data:', error);
    return false;
  }

  console.log('Sample parking data generated successfully');
  return true;
}

// Initialize with sample data
export async function initializeSampleData() {
  console.log('Initializing sample data...');
  
  const trafficSuccess = await generateSampleTrafficData();
  const parkingSuccess = await generateSampleParkingData();
  
  if (trafficSuccess && parkingSuccess) {
    console.log('All sample data initialized successfully');
    return true;
  }
  
  return false;
}