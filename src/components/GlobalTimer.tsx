"use client";

import { useEffect } from "react";
import { useRestaurantStore } from "@/store/useRestaurantStore";

export function GlobalTimer() {
  const { tickTime, demoMode, simulateOrder } = useRestaurantStore();

  useEffect(() => {
    const tick = setInterval(() => {
      tickTime();
    }, 1000);
    return () => clearInterval(tick);
  }, [tickTime]);

  useEffect(() => {
    if (demoMode) {
      const interval = setInterval(() => {
        simulateOrder();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [demoMode, simulateOrder]);

  return null;
}
