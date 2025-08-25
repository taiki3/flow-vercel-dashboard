import { useEffect, useRef } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);

  useEffect(() => {
    // React 18のStrict Modeによる二重実行を防ぐ
    // マップが既に初期化されている場合は、何もしない
    if (map.current) return;

    // mapContainer.currentが存在しない場合も処理を中断
    if (!mapContainer.current) return;

    // APIキーは環境変数から取得（フォールバックあり）
    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY || '9cCpjscGHon3xPEFPZZ4';

    if (!apiKey || apiKey === '9cCpjscGHon3xPEFPZZ4') {
      console.warn("MapTiler APIキーが設定されていないか、デフォルトキーを使用しています。");
    }

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
        center: [139.6380, 35.4660], // 横浜の座標
        zoom: 12,
        pitch: 0,
        bearing: 0
      });

      const currentMap = map.current;

      // 空の画像IDエラーを安全に無視する
      // このエラーは地図スタイル自体に起因することがあり、レンダリングをブロックするものではない
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
        console.log('Map loaded successfully');
      });

      // エラーハンドリング（styleimagemissing以外の重要なエラーのみ）
      currentMap.on('error', (e) => {
        // 空の画像名エラーは無視
        if (e.error?.message?.includes('Image " "') || 
            e.error?.message?.includes('styleimagemissing')) {
          return;
        }
        
        // APIキー関連のエラーのみログ出力
        if (e.error?.message?.includes('401') || e.error?.message?.includes('403')) {
          console.error('MapTiler APIキーの認証に失敗しました。APIキーを確認してください。');
        } else {
          console.error('Map error:', e);
        }
      });

      // コントロールの追加
      currentMap.addControl(new maplibregl.NavigationControl(), 'top-right');
      currentMap.addControl(new maplibregl.FullscreenControl(), 'top-right');
      currentMap.addControl(new maplibregl.ScaleControl({
        maxWidth: 200,
        unit: 'metric'
      }), 'bottom-left');

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
        {(!import.meta.env.VITE_MAPTILER_API_KEY || 
          import.meta.env.VITE_MAPTILER_API_KEY === '9cCpjscGHon3xPEFPZZ4') && (
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
            注意: MapTilerのAPIキーが設定されていないか、デフォルトキーを使用しています。
            本番環境では独自のAPIキーを設定してください。
          </div>
        )}
      </CardContent>
    </Card>
  );
}