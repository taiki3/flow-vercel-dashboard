import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // MapTiler APIキー
      const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || '9cCpjscGHon3xPEFPZZ4';
      
      console.log('Initializing map with API key:', apiKey);

      // 地図の初期化 - MapTiler Streets style
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/jp-mierune-streets/style.json?key=${apiKey}`,
        center: [139.6380, 35.4660], // 横浜の座標
        zoom: 13,
        pitch: 0,
        bearing: 0
      });

      // 地図のロードイベント
      map.current.on('load', () => {
        console.log('Map loaded successfully');
      });

      // エラーハンドリング
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        if (e.error?.message?.includes('401') || e.error?.message?.includes('403')) {
          setMapError('APIキーの認証に失敗しました。APIキーを確認してください。');
        } else {
          setMapError('地図の読み込みに失敗しました');
        }
      });

      // ナビゲーションコントロールを追加
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // フルスクリーンコントロールを追加
      map.current.addControl(new maplibregl.FullscreenControl());

      // スケールコントロールを追加
      map.current.addControl(new maplibregl.ScaleControl({
        maxWidth: 200,
        unit: 'metric'
      }), 'bottom-left');

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError('地図の初期化に失敗しました');
    }

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
        {mapError && (
          <div className="p-4 text-red-600 bg-red-50 rounded-t-lg">
            {mapError}
          </div>
        )}
        <div 
          ref={mapContainer} 
          className="w-full h-[600px] rounded-b-lg"
          style={{ backgroundColor: '#f0f0f0' }}
        />
      </CardContent>
    </Card>
  );
}