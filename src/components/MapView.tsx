import { useEffect, useRef } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);

  useEffect(() => {
    // React 18のStrict Modeによる二重実行を防ぐ
    if (map.current) return;

    // mapContainer.currentが存在しない場合も処理を中断
    if (!mapContainer.current) return;

    try {
      // OpenStreetMapのタイルを直接使用する設定
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles-layer',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [139.6380, 35.4660], // 横浜の座標
        zoom: 12,
        pitch: 0,
        bearing: 0
      });

      const currentMap = map.current;

      // 地図のロードイベント
      currentMap.on('load', () => {
        console.log('Map loaded successfully with OpenStreetMap tiles');
      });

      // エラーハンドリング
      currentMap.on('error', (e) => {
        console.error('Map error:', e);
      });

      // コントロールの追加
      currentMap.addControl(new maplibregl.NavigationControl(), 'top-right');
      currentMap.addControl(new maplibregl.FullscreenControl(), 'top-right');
      currentMap.addControl(new maplibregl.ScaleControl({
        maxWidth: 200,
        unit: 'metric'
      }), 'bottom-left');

      // 著作権表示
      currentMap.addControl(new maplibregl.AttributionControl({
        compact: false
      }));

    } catch (error) {
      console.error('地図の初期化に失敗しました:', error);
    }

    // コンポーネントがアンマウントされる際にマップをクリーンアップ
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []); // 依存配列は空のまま

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>リアルタイム交通状況マップ</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div 
          ref={mapContainer} 
          className="w-full h-[600px] rounded-b-lg"
          style={{ backgroundColor: '#f0f0f0' }}
        />
      </CardContent>
    </Card>
  );
}