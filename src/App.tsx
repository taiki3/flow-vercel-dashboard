import { TrafficNavigation } from "./components/TrafficNavigation";
import { TrafficOverviewV2 } from "./components/TrafficOverviewV2";
import { TrafficTrends } from "./components/TrafficTrends";
import { MapView } from "./components/MapView";
import { useHashRoute } from "./hooks/useHashRoute";
import { FlightInfo } from "./components/FlightInfo";
import { AlertsView } from "./components/AlertsView";

export default function App() {
  const { route } = useHashRoute();
  return (
    <div className="min-h-screen bg-background">
      <TrafficNavigation />
      
      <main className="pt-16">
        <div className="container mx-auto px-6 py-8 space-y-8">
          {route === "dashboard" && (
            <>
              {/* Current Traffic Overview - Flow Post Data */}
              <TrafficOverviewV2 />
              {/* Traffic Trends and Analytics */}
              <TrafficTrends />
              {/* Interactive Map View */}
              <MapView />
            </>
          )}

          {route === "flights" && <FlightInfo />}
          {route === "alerts" && <AlertsView />}
        </div>
      </main>
    </div>
  );
}
