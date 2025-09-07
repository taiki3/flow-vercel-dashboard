import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { AlertTriangle, Bell, Settings, Car, Users, MapPin } from "lucide-react";

type AlertItem = {
  id: string;
  type: "交通量" | "混雑率" | "駐車場" | "違法駐車" | "その他";
  severity: "high" | "medium" | "low";
  message: string;
  timestamp: string; // ISO or time string
  location?: string;
  status: "active" | "resolved" | "maintenance";
};

const alerts: AlertItem[] = [
  { id: "a-1001", type: "交通量", severity: "high", message: "主要交差点で交通量が急増", timestamp: "14:22", location: "T1 北側交差点", status: "active" },
  { id: "a-1002", type: "駐車場", severity: "medium", message: "P3 駐車場の空きが10%未満", timestamp: "14:10", location: "P3", status: "active" },
  { id: "a-1003", type: "違法駐車", severity: "medium", message: "出発ターミナル前に違法駐車", timestamp: "13:58", location: "T2 前", status: "resolved" },
  { id: "a-1004", type: "混雑率", severity: "low", message: "歩行者混雑が閾値を超過", timestamp: "13:41", location: "連絡通路", status: "active" },
];

const settingsInit = {
  email: "ops@example.com",
  emailNotifications: true,
  systemAlerts: true,
  trafficThreshold: 12000,
  congestionThreshold: 80,
  parkingThreshold: 85,
  violationsThreshold: 10,
};

function SeverityBadge({ severity }: { severity: AlertItem["severity"] }) {
  const map = {
    high: { label: "高", className: "bg-red-50 text-red-600" },
    medium: { label: "中", className: "bg-yellow-50 text-yellow-600" },
    low: { label: "低", className: "bg-green-50 text-green-600" },
  } as const;
  const cfg = map[severity];
  return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>;
}

function TypeIcon({ type }: { type: AlertItem["type"] }) {
  switch (type) {
    case "交通量": return <Car className="h-4 w-4" />;
    case "混雑率": return <Users className="h-4 w-4" />;
    case "駐車場": return <MapPin className="h-4 w-4" />;
    case "違法駐車": return <AlertTriangle className="h-4 w-4" />;
    default: return <Bell className="h-4 w-4" />;
  }
}

export function AlertsView() {
  const activeCount = alerts.filter(a => a.status === "active").length;
  const resolvedCount = alerts.filter(a => a.status === "resolved").length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-lg p-6">
        <h1 className="text-2xl font-medium mb-2">アラート</h1>
        <p className="text-muted-foreground">検知イベント、通知設定、履歴の管理</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">発生中</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">解決済み (直近)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedCount}</div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">通知設定</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">メール/システム通知</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">監視指標</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">交通量/混雑/駐車</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> 発生中のアラート</CardTitle>
            <CardDescription>最新のイベント一覧</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="divide-y">
                {alerts.map((a) => (
                  <div key={a.id} className="flex items-start justify-between py-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <TypeIcon type={a.type} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{a.type}</span>
                          <SeverityBadge severity={a.severity} />
                          <Badge variant="outline" className="text-xs">{a.status === "active" ? "発生中" : a.status === "resolved" ? "解決済" : "メンテ"}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground truncate">{a.message}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-4 mt-1">
                          <span>{a.timestamp}</span>
                          {a.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.location}</span>}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">詳細</Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Settings */}
        <AlertSettings />
      </div>
    </div>
  );
}

function AlertSettings() {
  const s = settingsInit;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> 通知・閾値設定</CardTitle>
        <CardDescription>通知先と警告レベルの閾値を設定</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">通知設定</h4>
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" defaultValue={s.email} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="email-notifications" defaultChecked={s.emailNotifications} />
            <Label htmlFor="email-notifications">メール通知を有効にする</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="system-alerts" defaultChecked={s.systemAlerts} />
            <Label htmlFor="system-alerts">システムアラートを有効にする</Label>
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <h4 className="text-sm font-medium">警告閾値</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="traffic-threshold">交通量閾値 (台/時)</Label>
              <Input id="traffic-threshold" type="number" defaultValue={s.trafficThreshold} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="congestion-threshold">混雑率閾値 (%)</Label>
              <Input id="congestion-threshold" type="number" defaultValue={s.congestionThreshold} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parking-threshold">駐車場利用率閾値 (%)</Label>
              <Input id="parking-threshold" type="number" defaultValue={s.parkingThreshold} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="violations-threshold">違法駐車閾値 (台)</Label>
              <Input id="violations-threshold" type="number" defaultValue={s.violationsThreshold} />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button>
            <Settings className="mr-2 h-4 w-4" /> 設定を保存
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
