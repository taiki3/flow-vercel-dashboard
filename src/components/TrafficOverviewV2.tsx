import { Car, Users, Bike, Package, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useTrafficSummary, useParkingSummary } from "../hooks/useFlowPostData";
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

const getTrafficStatus = (count: number, type: string): string => {
  switch (type) {
    case "car":
      return count > 10000 ? "警告" : count > 5000 ? "注意" : "正常";
    case "pedestrian":
      return count > 5000 ? "警告" : count > 2000 ? "注意" : "正常";
    case "cyclist":
      return count > 1000 ? "警告" : count > 500 ? "注意" : "正常";
    case "parking":
      const rate = count; // For parking, we pass the occupancy rate
      return rate > 90 ? "警告" : rate > 75 ? "注意" : "正常";
    default:
      return "正常";
  }
};

export function TrafficOverviewV2() {
  const { summary: trafficSummary, loading: trafficLoading, error: trafficError } = useTrafficSummary();
  const { summary: parkingSummary, loading: parkingLoading, error: parkingError } = useParkingSummary();
  
  const currentTime = trafficSummary 
    ? new Date(trafficSummary.timestamp).toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : '--:--';

  const trafficMetrics = [
    {
      title: "車両",
      value: trafficSummary?.car_count || 0,
      unit: "台",
      icon: Car,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      status: getTrafficStatus(trafficSummary?.car_count || 0, "car"),
      type: "car"
    },
    {
      title: "歩行者",
      value: trafficSummary?.pedestrian_count || 0,
      unit: "人",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      status: getTrafficStatus(trafficSummary?.pedestrian_count || 0, "pedestrian"),
      type: "pedestrian"
    },
    {
      title: "自転車",
      value: trafficSummary?.cyclist_count || 0,
      unit: "台",
      icon: Bike,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      status: getTrafficStatus(trafficSummary?.cyclist_count || 0, "cyclist"),
      type: "cyclist"
    },
    {
      title: "駐車場利用率",
      value: parkingSummary?.occupancy_rate || 0,
      unit: "%",
      subtitle: `${parkingSummary?.occupied_spaces || 0}/${(parkingSummary?.occupied_spaces || 0) + (parkingSummary?.available_spaces || 0)}台`,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      status: getTrafficStatus(parkingSummary?.occupancy_rate || 0, "parking"),
      type: "parking"
    }
  ];

  if (trafficError || parkingError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            エラー: {trafficError || parkingError}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6">
        <h1 className="text-2xl font-medium mb-2">Flow Post 交通監視ダッシュボード</h1>
        <p className="text-muted-foreground">
          最終更新: {currentTime} | データソース: Flow Post Analytics
        </p>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {trafficMetrics.map((data) => {
          const Icon = data.icon;
          
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
                {(trafficLoading || parkingLoading) ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-semibold">{data.value.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">{data.unit}</span>
                    </div>
                    {data.subtitle && (
                      <div className="text-xs text-muted-foreground">
                        {data.subtitle}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>総合統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-semibold text-blue-600">
                {trafficSummary?.total_count.toLocaleString() || 0}
              </div>
              <div className="text-sm text-blue-600">総検出オブジェクト数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-semibold text-green-600">
                {trafficSummary?.misc_count.toLocaleString() || 0}
              </div>
              <div className="text-sm text-green-600">その他オブジェクト</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-semibold text-purple-600">
                {parkingSummary?.available_spaces || 0}
              </div>
              <div className="text-sm text-purple-600">空き駐車スペース</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}