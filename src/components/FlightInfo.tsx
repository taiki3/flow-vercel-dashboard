import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Plane, Clock, MapPin, Users, TrendingUp, TrendingDown } from "lucide-react";

type FlightArrival = {
  id: string;
  airline: string;
  from: string;
  scheduledTime: string;
  actualTime: string;
  status: string;
  gate: string;
  passengers: number;
};

type FlightDeparture = {
  id: string;
  airline: string;
  to: string;
  scheduledTime: string;
  actualTime: string;
  status: string;
  gate: string;
  passengers: number;
};

const flights = {
  arrivals: [
    { id: "JL101", airline: "JAL", from: "東京 (HND)", scheduledTime: "14:30", actualTime: "14:25", status: "着陸済み", gate: "A1", passengers: 189 },
    { id: "NH205", airline: "ANA", from: "大阪 (KIX)", scheduledTime: "14:45", actualTime: "14:45", status: "着陸中", gate: "B3", passengers: 156 },
    { id: "SK892", airline: "SAS", from: "ストックホルム", scheduledTime: "15:10", actualTime: "15:05", status: "到着予定", gate: "C2", passengers: 245 },
    { id: "LH714", airline: "Lufthansa", from: "フランクフルト", scheduledTime: "15:30", actualTime: "15:40", status: "遅延", gate: "C5", passengers: 298 },
  ] as FlightArrival[],
  departures: [
    { id: "JL102", airline: "JAL", to: "東京 (HND)", scheduledTime: "16:15", actualTime: "16:15", status: "搭乗中", gate: "A1", passengers: 167 },
    { id: "NH206", airline: "ANA", to: "大阪 (KIX)", scheduledTime: "16:30", actualTime: "16:30", status: "搭乗準備中", gate: "B3", passengers: 142 },
    { id: "BA456", airline: "BA", to: "ロンドン (LHR)", scheduledTime: "17:00", actualTime: "17:10", status: "遅延", gate: "C4", passengers: 289 },
    { id: "QF789", airline: "Qantas", to: "シドニー", scheduledTime: "17:45", actualTime: "17:45", status: "準備中", gate: "D2", passengers: 312 },
  ] as FlightDeparture[],
  stats: {
    totalArrivals: 24,
    totalDepartures: 18,
    onTimePerformance: 87,
    averageDelay: 8,
  },
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; color: string }> = {
    "着陸済み": { variant: "default", color: "text-green-600" },
    "着陸中": { variant: "secondary", color: "text-blue-600" },
    "到着予定": { variant: "outline", color: "text-gray-600" },
    "アプローチ中": { variant: "secondary", color: "text-blue-600" },
    "遅延": { variant: "destructive", color: "text-red-600" },
    "搭乗中": { variant: "default", color: "text-green-600" },
    "搭乗準備中": { variant: "secondary", color: "text-blue-600" },
    "準備中": { variant: "outline", color: "text-gray-600" },
  };
  const cfg = map[status] || map["準備中"];
  return <Badge variant={cfg.variant}>{status}</Badge>;
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <span className="shrink-0 text-xs">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function ArrivalItem({ f }: { f: FlightArrival }) {
  return (
    <div className="grid grid-cols-12 items-center gap-4 py-3 border-b last:border-b-0">
      <div className="col-span-12 md:col-span-5 flex items-center gap-3 min-w-0">
        <Plane className="h-4 w-4 text-blue-600" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{f.id}</span>
            <StatusBadge status={f.status} />
          </div>
          <div className="text-xs text-muted-foreground truncate">{f.airline}・{f.from}</div>
        </div>
      </div>
      <div className="col-span-12 md:col-span-7 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1">
        <InfoCell label="予定" value={f.scheduledTime} />
        <InfoCell label="実績" value={f.actualTime} />
        <InfoCell label="ゲート" value={f.gate} />
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />{f.passengers}
        </div>
      </div>
    </div>
  );
}

function DepartureItem({ f }: { f: FlightDeparture }) {
  return (
    <div className="grid grid-cols-12 items-center gap-4 py-3 border-b last:border-b-0">
      <div className="col-span-12 md:col-span-5 flex items-center gap-3 min-w-0">
        <Plane className="h-4 w-4 text-purple-600" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{f.id}</span>
            <StatusBadge status={f.status} />
          </div>
          <div className="text-xs text-muted-foreground truncate">{f.airline}・{f.to}</div>
        </div>
      </div>
      <div className="col-span-12 md:col-span-7 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1">
        <InfoCell label="予定" value={f.scheduledTime} />
        <InfoCell label="実績" value={f.actualTime} />
        <InfoCell label="ゲート" value={f.gate} />
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />{f.passengers}
        </div>
      </div>
    </div>
  );
}

export function FlightInfo() {
  const { totalArrivals, totalDepartures, onTimePerformance, averageDelay } = flights.stats;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6">
        <h1 className="text-2xl font-medium mb-2">フライト情報</h1>
        <p className="text-muted-foreground">到着・出発の状況と運行指標</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>到着便</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {totalArrivals}
              <span className="text-sm font-normal text-muted-foreground ml-1">本</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>出発便</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {totalDepartures}
              <span className="text-sm font-normal text-muted-foreground ml-1">本</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>定時運行率</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold flex items-center gap-2">
              {onTimePerformance}%
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>平均遅延</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold flex items-center gap-2">
              {averageDelay} 分
              <TrendingDown className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrivals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" /> 到着便
            </CardTitle>
            <CardDescription>直近の到着状況</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[480px]">
              <div className="divide-y">
                {flights.arrivals.map((f) => (
                  <ArrivalItem key={f.id} f={f} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Departures */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" /> 出発便
            </CardTitle>
            <CardDescription>直近の出発状況</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[480px]">
              <div className="divide-y">
                {flights.departures.map((f) => (
                  <DepartureItem key={f.id} f={f} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
