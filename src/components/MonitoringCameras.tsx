import { Camera, Video, AlertCircle, Settings, Maximize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const cameraData = [
  {
    id: "CAM-001",
    name: "メインストリート交差点",
    status: "オンライン",
    location: "北側交差点",
    lastUpdate: "2分前"
  },
  {
    id: "CAM-002", 
    name: "ショッピングモール入口",
    status: "オンライン",
    location: "西側入口",
    lastUpdate: "1分前"
  },
  {
    id: "CAM-003",
    name: "駐車場エリアA",
    status: "オンライン", 
    location: "地下駐車場",
    lastUpdate: "30秒前"
  },
  {
    id: "CAM-004",
    name: "バス停周辺",
    status: "オフライン",
    location: "東側バス停",
    lastUpdate: "15分前"
  },
  {
    id: "CAM-005",
    name: "歩行者専用道路",
    status: "オンライン",
    location: "南側歩道",
    lastUpdate: "45秒前"
  },
  {
    id: "CAM-006",
    name: "配送車両エリア",
    status: "メンテナンス",
    location: "バックヤード",
    lastUpdate: "1時間前"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "オンライン":
      return "text-green-600 bg-green-100";
    case "オフライン":
      return "text-red-600 bg-red-100";
    case "メンテナンス":
      return "text-yellow-600 bg-yellow-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const CameraPlaceholder = ({ camera }: { camera: typeof cameraData[0] }) => (
  <Card className="h-full">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium">{camera.name}</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={getStatusColor(camera.status)}>
            {camera.status}
          </Badge>
          <Button variant="ghost" size="sm">
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{camera.location}</p>
    </CardHeader>
    <CardContent className="p-3">
      <div className="aspect-video bg-gray-300 rounded-lg flex items-center justify-center mb-2">
        {camera.status === "オンライン" ? (
          <div className="text-center text-gray-600">
            <Video className="h-8 w-8 mx-auto mb-2" />
            <div className="text-sm">ライブ映像</div>
            <div className="text-xs">映像信号正常</div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <div className="text-sm">映像なし</div>
            <div className="text-xs">{camera.status}</div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{camera.id}</span>
        <span>更新: {camera.lastUpdate}</span>
      </div>
    </CardContent>
  </Card>
);

export function MonitoringCameras() {
  const onlineCameras = cameraData.filter(cam => cam.status === "オンライン").length;
  const totalCameras = cameraData.length;

  return (
    <div className="space-y-6">
      {/* Camera System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>監視カメラシステム</span>
            <Badge variant="outline" className="ml-auto">
              {onlineCameras}/{totalCameras} オンライン
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-semibold text-green-600">{onlineCameras}</div>
              <div className="text-sm text-green-600">正常稼働</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-semibold text-red-600">
                {cameraData.filter(cam => cam.status === "オフライン").length}
              </div>
              <div className="text-sm text-red-600">オフライン</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-xl font-semibold text-yellow-600">
                {cameraData.filter(cam => cam.status === "メンテナンス").length}
              </div>
              <div className="text-sm text-yellow-600">メンテナンス</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              すべてのカメラは高解像度でリアルタイム録画中です
            </p>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              設定
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameraData.map((camera) => (
          <CameraPlaceholder key={camera.id} camera={camera} />
        ))}
      </div>

      {/* Recording Status */}
      <Card>
        <CardHeader>
          <CardTitle>録画状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">今日の録画容量</span>
              <span className="text-sm font-medium">245 GB / 500 GB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '49%' }}></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>• 自動削除: 30日後</div>
              <div>• バックアップ: 毎日午前2時</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}