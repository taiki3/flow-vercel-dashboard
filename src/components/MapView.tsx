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
    if (!mapContainer.current) {
      console.error('Map container is not available');
      return;
    }

    console.log('Initializing map with container:', mapContainer.current);
    console.log('Container dimensions:', {
      width: mapContainer.current.offsetWidth,
      height: mapContainer.current.offsetHeight
    });

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
        console.log('Map center:', currentMap.getCenter());
        console.log('Map zoom:', currentMap.getZoom());
        console.log('Map bounds:', currentMap.getBounds());
        
        // キャンバス要素の確認
        const canvas = mapContainer.current?.querySelector('canvas');
        if (canvas) {
          console.log('Canvas found:', {
            width: canvas.width,
            height: canvas.height,
            style: canvas.style.cssText
          });
        } else {
          console.error('Canvas element not found in map container');
        }
      });

      // タイルの読み込み状態を監視
      currentMap.on('data', (e) => {
        if (e.sourceDataType === 'visibility' || e.isSourceLoaded) {
          console.log('Map data event:', e.type, e.sourceDataType);
        }
      });

      // レンダリング完了イベント
      currentMap.on('render', () => {
        console.log('Map rendered');
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
      <CardContent className="p-0 relative overflow-hidden">
        <div 
          ref={mapContainer} 
          className="w-full rounded-b-lg"
          style={{ 
            height: '600px',
            backgroundColor: '#f0f0f0',
            position: 'relative'
          }}
        />
      </CardContent>
    </Card>
  );
}