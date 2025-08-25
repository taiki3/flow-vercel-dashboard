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
      // MapTilerの衛星写真スタイルを使用
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/hybrid/style.json?key=${apiKey}`,
        center: [140.38660526412602, 35.76508886395624], // 成田空港第一ターミナル
        zoom: 16,
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
        
        // 中央下に半透明の長方形を3つ横に並べて追加
        const center = currentMap.getCenter();
        const bounds = currentMap.getBounds();
        const mapContainer = currentMap.getContainer();
        
        // 90px下にオフセット（地図の高さに対する比率で計算）
        const mapHeight = mapContainer.offsetHeight;
        const mapWidth = mapContainer.offsetWidth;
        const pixelOffsetY = 90;
        const latRange = bounds.getNorth() - bounds.getSouth();
        const lngRange = bounds.getEast() - bounds.getWest();
        const latOffset = (latRange * pixelOffsetY) / mapHeight;
        
        // 長方形のサイズ（度単位で概算）- 20x10px
        const rectWidth = (lngRange * 20) / mapWidth;  // 約20px相当
        const rectHeight = (latRange * 10) / mapHeight; // 約10px相当
        const spacing = (lngRange * 10) / mapWidth; // 10px間隔
        
        // 3つの長方形の中心Y座標
        const centerY = center.lat - latOffset;
        
        // 3つの長方形を含むFeatureCollection
        const rectangles = {
          type: 'FeatureCollection',
          features: [
            // 左の長方形（赤色）
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [center.lng - rectWidth - spacing - rectWidth/2, centerY - rectHeight/2],
                  [center.lng - spacing - rectWidth/2, centerY - rectHeight/2],
                  [center.lng - spacing - rectWidth/2, centerY + rectHeight/2],
                  [center.lng - rectWidth - spacing - rectWidth/2, centerY + rectHeight/2],
                  [center.lng - rectWidth - spacing - rectWidth/2, centerY - rectHeight/2]
                ]]
              },
              properties: {
                color: 'red',
                vehicleNumber: 3248,
                parkingTime: '01:45:23',
                imageUrl: '/picture/0001.jpg'
              }
            },
            // 中央の長方形
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [center.lng - rectWidth/2, centerY - rectHeight/2],
                  [center.lng + rectWidth/2, centerY - rectHeight/2],
                  [center.lng + rectWidth/2, centerY + rectHeight/2],
                  [center.lng - rectWidth/2, centerY + rectHeight/2],
                  [center.lng - rectWidth/2, centerY - rectHeight/2]
                ]]
              },
              properties: {
                color: 'blue',
                vehicleNumber: 7891,
                parkingTime: '00:23:15',
                imageUrl: '/picture/0002.jpg'
              }
            },
            // 右の長方形
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [center.lng + spacing + rectWidth/2, centerY - rectHeight/2],
                  [center.lng + rectWidth + spacing + rectWidth/2, centerY - rectHeight/2],
                  [center.lng + rectWidth + spacing + rectWidth/2, centerY + rectHeight/2],
                  [center.lng + spacing + rectWidth/2, centerY + rectHeight/2],
                  [center.lng + spacing + rectWidth/2, centerY - rectHeight/2]
                ]]
              },
              properties: {
                color: 'blue',
                vehicleNumber: 5612,
                parkingTime: '02:01:47',
                imageUrl: '/picture/0003.jpg'
              }
            }
          ]
        };
        
        // GeoJSON形式で長方形を定義
        currentMap.addSource('center-rectangles', {
          type: 'geojson',
          data: rectangles
        });
        
        // 半透明の長方形レイヤーを追加（色はプロパティに基づいて設定）
        currentMap.addLayer({
          id: 'center-rectangles-layer',
          type: 'fill',
          source: 'center-rectangles',
          paint: {
            'fill-color': [
              'match',
              ['get', 'color'],
              'red', '#CC0033',
              'blue', '#0066CC',
              '#0066CC' // デフォルト
            ],
            'fill-opacity': 0.5
          }
        });
        
        // 長方形の境界線も追加（色はプロパティに基づいて設定）
        currentMap.addLayer({
          id: 'center-rectangles-outline',
          type: 'line',
          source: 'center-rectangles',
          paint: {
            'line-color': [
              'match',
              ['get', 'color'],
              'red', '#990022',
              'blue', '#0044AA',
              '#0044AA' // デフォルト
            ],
            'line-width': 2,
            'line-opacity': 0.8
          }
        });
        
        // カーソルをポインターに変更（ホバー時）
        currentMap.on('mouseenter', 'center-rectangles-layer', () => {
          currentMap.getCanvas().style.cursor = 'pointer';
        });
        
        currentMap.on('mouseleave', 'center-rectangles-layer', () => {
          currentMap.getCanvas().style.cursor = '';
        });
        
        // クリックイベントでポップアップを表示
        currentMap.on('click', 'center-rectangles-layer', (e) => {
          if (!e.features || e.features.length === 0) return;
          
          const feature = e.features[0];
          const coordinates = e.lngLat;
          const vehicleNumber = feature.properties?.vehicleNumber;
          const parkingTime = feature.properties?.parkingTime;
          const imageUrl = feature.properties?.imageUrl;
          
          // ポップアップの内容
          const popupContent = `
            <div style="padding: 10px; font-size: 14px; min-width: 150px;">
              <div style="font-weight: bold; margin-bottom: 8px;">駐車情報</div>
              ${imageUrl ? `
                <div style="margin-bottom: 8px; text-align: center;">
                  <img src="${imageUrl}" alt="車両画像" style="height: 60px; width: auto; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                </div>
              ` : ''}
              <div style="margin-bottom: 2px;">車番: <strong>${vehicleNumber}</strong></div>
              <div>駐車時間: <strong>${parkingTime}</strong></div>
            </div>
          `;
          
          // ポップアップを作成して表示
          new maplibregl.Popup({
            closeButton: true,
            closeOnClick: true,
            offset: [0, -10]
          })
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(currentMap);
        });
        
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