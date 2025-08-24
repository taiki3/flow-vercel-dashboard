import { TrendingUp, Users, Target, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const chartData = [
  { name: "1月", value: 400, goal: 500 },
  { name: "2月", value: 300, goal: 500 },
  { name: "3月", value: 600, goal: 500 },
  { name: "4月", value: 800, goal: 500 },
  { name: "5月", value: 700, goal: 500 },
  { name: "6月", value: 900, goal: 500 },
];

const stats = [
  {
    title: "総売上",
    value: "¥2,456,000",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-green-600"
  },
  {
    title: "アクティブユーザー",
    value: "1,234",
    change: "+8.2%",
    icon: Users,
    color: "text-blue-600"
  },
  {
    title: "完了プロジェクト",
    value: "89",
    change: "+15.3%",
    icon: Target,
    color: "text-purple-600"
  },
  {
    title: "成長率",
    value: "23.8%",
    change: "+2.4%",
    icon: TrendingUp,
    color: "text-orange-600"
  }
];

export function HeroPanel() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <h1 className="text-2xl font-medium mb-2">おかえりなさい、山田さん</h1>
        <p className="text-muted-foreground">今日の業績を確認して、目標を達成しましょう</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stat.value}</div>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.change} 前月比
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>月別パフォーマンス</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="goal" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>目標達成状況</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
                <Bar dataKey="goal" fill="hsl(var(--muted))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>今月の目標進捗</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>売上目標</span>
              <span>78%</span>
            </div>
            <Progress value={78} className="w-full" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>プロジェクト完了</span>
              <span>92%</span>
            </div>
            <Progress value={92} className="w-full" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>顧客満足度</span>
              <span>85%</span>
            </div>
            <Progress value={85} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}