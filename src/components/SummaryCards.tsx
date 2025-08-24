import { Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

const summaryData = [
  {
    title: "今日のタスク",
    count: "12",
    subtitle: "4件完了済み",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "進行中プロジェクト",
    count: "8",
    subtitle: "2件が締切間近",
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "未完了タスク",
    count: "23",
    subtitle: "優先度: 高が5件",
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    title: "今週のミーティング",
    count: "7",
    subtitle: "明日3件予定",
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  }
];

const recentActivities = [
  {
    id: 1,
    action: "プロジェクト「WEBサイトリニューアル」を完了",
    time: "2時間前",
    type: "success"
  },
  {
    id: 2,
    action: "新しいチームメンバーが参加",
    time: "4時間前",
    type: "info"
  },
  {
    id: 3,
    action: "クライアント会議の予定が変更",
    time: "6時間前",
    type: "warning"
  },
  {
    id: 4,
    action: "月次レポートが提出されました",
    time: "1日前",
    type: "success"
  }
];

export function SummaryCards() {
  return (
    <div className="space-y-6">
      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${item.bgColor}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">{item.count}</div>
                    <div className="text-sm text-muted-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.subtitle}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>最近のアクティビティ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant={
                  activity.type === 'success' ? 'default' :
                  activity.type === 'warning' ? 'secondary' : 'outline'
                }>
                  {activity.type === 'success' ? '完了' :
                   activity.type === 'warning' ? '変更' : '情報'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}