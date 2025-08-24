import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { useTrafficTrends } from "../hooks/useFlowPostData";
import { Skeleton } from "./ui/skeleton";

export function TrafficTrends() {
  const { trends, loading, error } = useTrafficTrends();

  console.log('TrafficTrends - loading:', loading, 'error:', error, 'trends count:', trends.length);
  if (trends.length > 0) {
    console.log('First trend data:', trends[0]);
  }

  // Format data for charts
  const chartData = trends.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    交通量: item.total_count,
    車両: item.car_count,
    歩行者: item.pedestrian_count,
    自転車: item.cyclist_count
  }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
      <h2 className="text-xl font-semibold">トレンド分析</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Volume Trend */}
        <Card>
          <CardHeader>
            <CardTitle>交通量の推移</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="交通量" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorTraffic)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vehicle Count Trend */}
        <Card>
          <CardHeader>
            <CardTitle>車両通行量の推移</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="車両" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pedestrian Count Trend */}
        <Card>
          <CardHeader>
            <CardTitle>歩行者数の推移</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPedestrian" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="歩行者" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorPedestrian)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cyclist Count Trend */}
        <Card>
          <CardHeader>
            <CardTitle>自転車通行量の推移</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar 
                  dataKey="自転車" 
                  fill="#dc2626" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>24時間統計サマリー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">平均交通量</p>
              <p className="text-2xl font-semibold">
                {trends.length > 0 
                  ? Math.round(trends.reduce((acc, t) => acc + t.total_count, 0) / trends.length)
                  : 0}
                <span className="text-sm font-normal text-muted-foreground ml-1">件/時</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">平均車両数</p>
              <p className="text-2xl font-semibold">
                {trends.length > 0 
                  ? Math.round(trends.reduce((acc, t) => acc + t.car_count, 0) / trends.length)
                  : 0}
                <span className="text-sm font-normal text-muted-foreground ml-1">台</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">平均歩行者数</p>
              <p className="text-2xl font-semibold">
                {trends.length > 0 
                  ? Math.round(trends.reduce((acc, t) => acc + t.pedestrian_count, 0) / trends.length)
                  : 0}
                <span className="text-sm font-normal text-muted-foreground ml-1">人</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">平均自転車数</p>
              <p className="text-2xl font-semibold">
                {trends.length > 0 
                  ? Math.round(trends.reduce((acc, t) => acc + t.cyclist_count, 0) / trends.length)
                  : 0}
                <span className="text-sm font-normal text-muted-foreground ml-1">台</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}