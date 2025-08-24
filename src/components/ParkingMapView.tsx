import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Rectangle, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useParkingData } from '../hooks/useTrafficData';
import type { ParkingData } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';

// Set default center to Tokyo Station area
const DEFAULT_CENTER = { lat: 35.6812, lng: 139.7671 };
const DEFAULT_ZOOM = 17;

// Vehicle sizes in meters (for visualization)
const VEHICLE_SIZES = {
  small: { width: 4, height: 2 },
  medium: { width: 5, height: 2.5 },
  large: { width: 8, height: 3 }
};

// Convert meters to degrees (rough approximation)
const metersToLat = (meters: number) => meters / 111111;
const metersToLng = (meters: number, lat: number) => meters / (111111 * Math.cos(lat * Math.PI / 180));

interface VehicleMarkerProps {
  vehicle: ParkingData;
}

function VehicleMarker({ vehicle }: VehicleMarkerProps) {
  const size = VEHICLE_SIZES[vehicle.vehicle_type];
  const latOffset = metersToLat(size.height) / 2;
  const lngOffset = metersToLng(size.width, vehicle.latitude) / 2;

  const bounds: [[number, number], [number, number]] = [
    [vehicle.latitude - latOffset, vehicle.longitude - lngOffset],
    [vehicle.latitude + latOffset, vehicle.longitude + lngOffset]
  ];

  const color = vehicle.vehicle_type === 'large' ? '#dc2626' : 
                 vehicle.vehicle_type === 'medium' ? '#f59e0b' : '#10b981';

  return (
    <Rectangle
      bounds={bounds}
      pathOptions={{
        fillColor: color,
        fillOpacity: 0.6,
        color: color,
        weight: 1
      }}
    />
  );
}

function MapController() {
  const map = useMap();
  
  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  return null;
}

export function ParkingMapView() {
  const { currentChunk, playbackIndex, isPlaying, togglePlayback, loading, error } = useParkingData();
  const [currentVehicles, setCurrentVehicles] = useState<ParkingData[]>([]);

  useEffect(() => {
    if (!currentChunk?.parking_data) return;

    // Filter vehicles for current playback minute
    const currentMinute = playbackIndex;
    const vehiclesAtTime = currentChunk.parking_data.filter((vehicle: ParkingData) => {
      const vehicleMinute = new Date(vehicle.timestamp).getMinutes() % 15;
      return vehicleMinute === currentMinute;
    });

    setCurrentVehicles(vehiclesAtTime);
  }, [currentChunk, playbackIndex]);

  const formatTime = () => {
    if (!currentChunk) return '--:--';
    const baseTime = new Date(currentChunk.chunk_timestamp);
    baseTime.setMinutes(baseTime.getMinutes() + playbackIndex);
    return baseTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">データを読み込み中...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">エラー: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>駐車状況マップ</CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              再生時刻: {formatTime()}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={togglePlayback}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {/* Map Container */}
          <div className="h-[500px] w-full">
            <MapContainer
              center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
              zoom={DEFAULT_ZOOM}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <MapController />
              {/* Satellite imagery tile layer */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              />
              
              {/* Vehicle markers */}
              {currentVehicles.map((vehicle, index) => (
                <VehicleMarker key={`${vehicle.id}-${index}`} vehicle={vehicle} />
              ))}
            </MapContainer>
          </div>

          {/* Playback progress bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
            <div className="flex items-center gap-3">
              <span className="text-white text-xs">0:00</span>
              <div className="flex-1 bg-white/20 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-200"
                  style={{ width: `${(playbackIndex / 14) * 100}%` }}
                />
              </div>
              <span className="text-white text-xs">15:00</span>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-lg shadow-lg">
            <div className="text-xs font-medium mb-2">車両サイズ</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs">小型車</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded"></div>
                <span className="text-xs">中型車</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span className="text-xs">大型車</span>
              </div>
            </div>
          </div>

          {/* Vehicle count */}
          <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg">
            <div className="text-xs font-medium">現在の駐車台数</div>
            <div className="text-2xl font-bold">{currentVehicles.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}