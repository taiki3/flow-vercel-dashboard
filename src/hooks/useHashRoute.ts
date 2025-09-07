import { useEffect, useState } from "react";

export type AppRoute = "dashboard" | "flights" | "alerts";

function parseHash(): AppRoute {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash.startsWith("flights")) return "flights";
  if (hash.startsWith("alerts")) return "alerts";
  return "dashboard";
}

export function useHashRoute() {
  const [route, setRoute] = useState<AppRoute>(() => parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (to: AppRoute) => {
    const next = to === "dashboard" ? "#/" : `#/${to}`;
    if (window.location.hash !== next) {
      window.location.hash = next;
    } else {
      // Force update when navigating to the same hash
      setRoute(parseHash());
    }
  };

  return { route, navigate } as const;
}

