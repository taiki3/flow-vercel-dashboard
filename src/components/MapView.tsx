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

    // MapTiler APIキー
    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || '9cCpjscGHon3xPEFPZZ4';

    try {
      // MapTilerのスタイルを使用
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/jp-mierune-streets/style.json?key=${apiKey}`,
        center: [140.38660526412602, 35.76508886395624], // 成田空港第一ターミナル
        zoom: 15,
        pitch: 0,
        bearing: 0,
        antialias: true
      });

      const currentMap = map.current;

      // 空の画像IDエラーを安全に無視する
      currentMap.on('styleimagemissing', (e) => {
        const id = e.id;
        if (!id || id.trim() === '') {
          // 空のIDの場合は何もせず処理を終了
          return;
        }
        console.warn(`見つからない画像ID: ${id}`);
      });

      // 地図のロードイベント
      currentMap.on('load', () => {
        console.log('Map loaded successfully with MapTiler style');
        
        // 3D建物レイヤーを追加（エラーが出ない範囲で）
        try {
          if (!currentMap.getSource('composite')) {
            return;
          }
          
          const layers = currentMap.getStyle().layers;
          const labelLayerId = layers?.find(
            layer => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
          )?.id;

          if (labelLayerId) {
            currentMap.addLayer({
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'height']
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
              }
            }, labelLayerId);
          }
        } catch (error) {
          // 3D建物の追加に失敗しても地図は表示する
          console.log('3D buildings not available for this style');
        }
      });

      // エラーハンドリング（重要なエラーのみ）
      currentMap.on('error', (e) => {
        // 空の画像名エラーやスタイル関連の警告は無視
        if (e.error?.message?.includes('Image " "') || 
            e.error?.message?.includes('styleimagemissing')) {
          return;
        }
        
        // APIキー関連のエラー
        if (e.error?.message?.includes('401') || e.error?.message?.includes('403')) {
          console.error('MapTiler APIキーの認証に失敗しました。');
        }
      });

      // コントロールの追加
      currentMap.addControl(new maplibregl.NavigationControl(), 'top-right');
      currentMap.addControl(new maplibregl.FullscreenControl(), 'top-right');
      currentMap.addControl(new maplibregl.ScaleControl({
        maxWidth: 200,
        unit: 'metric'
      }), 'bottom-left');

      // ジオロケーションコントロールを追加
      currentMap.addControl(new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }), 'top-right');

    } catch (error) {
      console.error('地図の初期化に失敗しました:', error);
    }

    // コンポーネントがアンマウントされる際にマップをクリーンアップ
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

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