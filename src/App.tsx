import { TrafficNavigation } from "./components/TrafficNavigation";
import { TrafficOverview } from "./components/TrafficOverview";
import { TrafficTrends } from "./components/TrafficTrends";
import { ParkingMapView } from "./components/ParkingMapView";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <TrafficNavigation />
      
      <main className="pt-16">
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Current Traffic Overview */}
          <TrafficOverview />
          
          {/* Parking Map View */}
          <ParkingMapView />
          
          {/* Traffic Trends and Analytics */}
          <TrafficTrends />
        </div>
      </main>
    </div>
  );
}