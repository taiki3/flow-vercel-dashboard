import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // MapTiler APIキー
    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || '9cCpjscGHon3xPEFPZZ4';

    // 地図の初期化
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
      center: [139.6380, 35.4660], // 横浜の座標
      zoom: 12,
      pitch: 45,
      bearing: -17.6
    });

    // ナビゲーションコントロールを追加
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // フルスクリーンコントロールを追加
    map.current.addControl(new maplibregl.FullscreenControl());

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>リアルタイム交通状況マップ</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapContainer} 
          className="w-full h-[600px] rounded-b-lg"
        />
      </CardContent>
    </Card>
  );
}