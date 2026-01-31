import { useEffect, useRef } from "react";

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    async function acquire() {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch {
        // Wake lock request failed (e.g. low battery, not supported)
      }
    }

    acquire();

    // Re-acquire when tab becomes visible again (wake lock is released on tab switch)
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        acquire();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      wakeLockRef.current?.release().catch(() => {});
    };
  }, []);
}
