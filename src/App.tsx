import { TrafficNavigation } from "./components/TrafficNavigation";
import { TrafficOverviewV2 } from "./components/TrafficOverviewV2";
import { TrafficTrends } from "./components/TrafficTrends";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <TrafficNavigation />
      
      <main className="pt-16">
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Current Traffic Overview - Flow Post Data */}
          <TrafficOverviewV2 />
          
          {/* Traffic Trends and Analytics */}
          <TrafficTrends />
        </div>
      </main>
    </div>
  );
}