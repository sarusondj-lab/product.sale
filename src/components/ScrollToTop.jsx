import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// 1. Tell the browser to NEVER remember scroll history (runs immediately)
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const forceTop = () => {
      // 2. Aggressively target every possible scroll container the browser uses
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Fire immediately when the route changes or page refreshes
    forceTop();

    // 3. Fire again 50ms and 100ms later. 
    // This perfectly overrides Chrome if it tries to pull you down AFTER React loads.
    const timer1 = setTimeout(forceTop, 50);
    const timer2 = setTimeout(forceTop, 100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname]);

  // Handle the absolute first load / hard refresh
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return null;
}