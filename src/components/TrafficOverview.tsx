import { Car, Users, ParkingCircle, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useTrafficData } from "../hooks/useTrafficData";
import { Skeleton } from "./ui/skeleton";

const getStatusColor = (status: string) => {
  switch (status) {
    case "正常":
      return "text-green-600 bg-green-100";
    case "注意":
      return "text-yellow-600 bg-yellow-100";
    case "警告":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getStatus = (type: string, value: number): string => {
  switch (type) {
    case "traffic":
      return value > 2000 ? "警告" : value > 1500 ? "注意" : "正常";
    case "congestion":
      return value > 80 ? "警告" : value > 60 ? "注意" : "正常";
    case "parking":
      return value > 90 ? "警告" : value > 75 ? "注意" : "正常";
    case "illegal":
      return value > 10 ? "警告" : value > 5 ? "注意" : "正常";
    default:
      return "正常";
  }
};

const calculateChange = (current: number, previous: number): string => {
  if (!previous) return "+0%";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};

export function TrafficOverview() {
  const { trafficData, trends, loading, error } = useTrafficData();
  
  const currentTime = trafficData 
    ? new Date(trafficData.timestamp).toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : '--:--';

  // Calculate changes from previous hour
  const previousData = trends.length > 1 ? trends[trends.length - 2] : null;

  const trafficMetrics = [
    {
      title: "交通量",
      value: trafficData?.traffic_volume || 0,
      unit: "台/時",
      change: previousData ? calculateChange(trafficData?.traffic_volume || 0, previousData.traffic_volume) : "+0%",
      trend: (trafficData?.traffic_volume || 0) > (previousData?.traffic_volume || 0) ? "up" : "down",
      icon: Car,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      status: getStatus("traffic", trafficData?.traffic_volume || 0),
      type: "traffic"
    },
    {
      title: "混雑率",
      value: trafficData?.congestion_rate || 0,
      unit: "%",
      change: previousData ? calculateChange(trafficData?.congestion_rate || 0, previousData.congestion_rate) : "+0%",
      trend: (trafficData?.congestion_rate || 0) > (previousData?.congestion_rate || 0) ? "up" : "down",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      status: getStatus("congestion", trafficData?.congestion_rate || 0),
      type: "congestion"
    },
    {
      title: "駐車場利用率",
      value: trafficData?.parking_utilization || 0,
      unit: "%",
      change: previousData ? calculateChange(trafficData?.parking_utilization || 0, previousData.parking_utilization) : "+0%",
      trend: (trafficData?.parking_utilization || 0) > (previousData?.parking_utilization || 0) ? "up" : "down",
      icon: ParkingCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      status: getStatus("parking", trafficData?.parking_utilization || 0),
      type: "parking"
    },
    {
      title: "違法駐車台数",
      value: trafficData?.illegal_parking_count || 0,
      unit: "台",
      change: previousData ? `${(trafficData?.illegal_parking_count || 0) - (previousData?.illegal_parking_count || 0)}台` : "+0台",
      trend: (trafficData?.illegal_parking_count || 0) > (previousData?.illegal_parking_count || 0) ? "up" : "down",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      status: getStatus("illegal", trafficData?.illegal_parking_count || 0),
      type: "illegal"
    }
  ];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6">
        <h1 className="text-2xl font-medium mb-2">交通監視ダッシュボード</h1>
        <p className="text-muted-foreground">
          最終更新: {currentTime} | 監視エリア: メインストリート周辺
        </p>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trafficMetrics.map((data) => {
          const Icon = data.icon;
          const TrendIcon = data.trend === "up" ? TrendingUp : TrendingDown;
          
          return (
            <Card key={data.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {data.title}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${data.color}`} />
                  <Badge variant="outline" className={getStatusColor(data.status)}>
                    {data.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-semibold">{data.value}</span>
                      <span className="text-sm text-muted-foreground">{data.unit}</span>
                    </div>
                    <div className={`flex items-center text-xs ${
                      data.type === "illegal" 
                        ? (data.trend === "up" ? "text-red-600" : "text-green-600")
                        : (data.trend === "up" ? "text-green-600" : "text-red-600")
                    }`}>
                      <TrendIcon className="h-3 w-3 mr-1" />
                      {data.change} 前時間比
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>システム状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-semibold text-green-600">
                {trafficMetrics.filter(m => m.status === "正常").length}
              </div>
              <div className="text-sm text-green-600">正常稼働中</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-semibold text-yellow-600">
                {trafficMetrics.filter(m => m.status === "注意").length}
              </div>
              <div className="text-sm text-yellow-600">注意が必要</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-semibold text-red-600">
                {trafficMetrics.filter(m => m.status === "警告").length}
              </div>
              <div className="text-sm text-red-600">警告発生中</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}