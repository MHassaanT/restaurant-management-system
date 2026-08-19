"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  useRestaurantStore, 
  StationType, 
  ItemStatus 
} from "@/store/useRestaurantStore";
import { isSupabaseConfigured } from "@/lib/supabase";
import { 
  ChefHat, 
  Clock, 
  Check, 
  Filter, 
  Wifi, 
  WifiOff, 
  ArrowLeft, 
  Flame,
  UtensilsCrossed
} from "lucide-react";

export default function KitchenDisplaySystem() {
  const { 
    orders, 
    orderItems, 
    tables, 
    fetchInitialData, 
    updateOrderItemStatus, 
    initRealtimeSubscriptions 
  } = useRestaurantStore();

  const [selectedStation, setSelectedStation] = useState<string>("All");
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    fetchInitialData();
    const unsub = initRealtimeSubscriptions();

    // Timer tick to calculate elapsed minutes live
    const interval = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 5000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [fetchInitialData, initRealtimeSubscriptions]);

  const stations: string[] = ["All", "BBQ", "Fast Food", "Drinks", "Desi"];

  // Filter orders that have pending or active items matching station
  const activeOrders = orders.filter((o) => o.status !== "Delivered");

  const calculateElapsedMins = (createdAt: string) => {
    if (!createdAt) return 0;
    const createdTime = new Date(createdAt).getTime();
    const diffMs = nowTimestamp - createdTime;
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const getTimerBadgeStyle = (elapsedMins: number) => {
    if (elapsedMins >= 15) {
      return "bg-rose-600 border-rose-400 text-white animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.4)]";
    }
    if (elapsedMins >= 8) {
      return "bg-amber-500 border-amber-300 text-amber-950 font-black shadow-[0_0_10px_rgba(245,158,11,0.3)]";
    }
    return "bg-emerald-950/80 border-emerald-500 text-emerald-300";
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col gap-6 select-none">
      {/* Tablet Top Navigation & Station Selector */}
      <header className="bg-neutral-900 border-4 border-neutral-800 p-6 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-3.5 bg-neutral-800 hover:bg-neutral-700 rounded-2xl border-2 border-neutral-700 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-amber-500" />
            </Link>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-white flex items-center gap-3">
                <ChefHat className="w-8 h-8 text-amber-500" />
                Kitchen Display System
              </h1>
              <p className="text-xs lg:text-sm text-neutral-400 font-bold mt-1">
                Real-Time Order Tickets & Station Station Routing
              </p>
            </div>
          </div>

          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border lg:hidden ${
            isSupabaseConfigured ? "bg-emerald-950 border-emerald-500 text-emerald-400" : "bg-amber-950 border-amber-500 text-amber-400"
          }`}>
            {isSupabaseConfigured ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isSupabaseConfigured ? "Live WebSocket" : "Offline Demo"}
          </span>
        </div>

        {/* Station Filter Toggle Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-center">
          <span className="text-xs font-black uppercase text-neutral-400 flex items-center gap-1.5 mr-1">
            <Filter className="w-4 h-4 text-amber-500" />
            Station:
          </span>
          {stations.map((station) => (
            <button
              key={station}
              onClick={() => setSelectedStation(station)}
              className={`px-5 py-3 rounded-2xl font-black text-base transition-all border-3 ${
                selectedStation === station
                  ? "bg-amber-500 border-amber-300 text-neutral-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105"
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {station}
            </button>
          ))}
        </div>
      </header>

      {/* Ticket Grid */}
      {activeOrders.length === 0 ? (
        <div className="flex-1 bg-neutral-900/60 border-4 border-dashed border-neutral-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 my-8">
          <UtensilsCrossed className="w-20 h-20 text-neutral-700" />
          <h2 className="text-3xl font-black text-neutral-500">No Active Kitchen Tickets</h2>
          <p className="text-neutral-600 max-w-md">
            New customer orders submitted via QR menu will automatically pop up here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 items-start">
          {activeOrders.map((order) => {
            const table = tables.find((t) => t.id === order.table_id);
            const tableNumber = table ? table.table_number : order.table_number || "?";

            // All items for this order
            let itemsForOrder = orderItems.filter((i) => i.order_id === order.id);

            // Filter items by selected station if not 'All'
            if (selectedStation !== "All") {
              itemsForOrder = itemsForOrder.filter((i) => i.station === selectedStation);
            }

            if (itemsForOrder.length === 0) return null;

            const elapsedMins = calculateElapsedMins(order.created_at);
            const allItemsReady = itemsForOrder.every((i) => i.status === "Ready");

            return (
              <div
                key={order.id}
                className={`bg-neutral-900 rounded-3xl border-4 transition-all overflow-hidden flex flex-col justify-between shadow-2xl ${
                  allItemsReady
                    ? "border-emerald-500/80 bg-neutral-900/90"
                    : elapsedMins >= 15
                    ? "border-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.3)]"
                    : "border-neutral-800 hover:border-neutral-700"
                }`}
              >
                {/* Ticket Header */}
                <div className="bg-neutral-950 p-5 border-b-4 border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-500 text-neutral-950 text-2xl font-black px-4 py-2 rounded-2xl border-2 border-amber-400">
                      Table #{tableNumber}
                    </span>
                  </div>

                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 ${getTimerBadgeStyle(elapsedMins)}`}>
                    <Clock className="w-4 h-4" />
                    <span>{elapsedMins}m ago</span>
                  </div>
                </div>

                {/* Ticket Items List */}
                <div className="p-5 space-y-4 flex-1">
                  {itemsForOrder.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border-3 flex items-center justify-between gap-4 transition-colors ${
                        item.status === "Ready"
                          ? "bg-emerald-950/40 border-emerald-600/60 text-emerald-200"
                          : "bg-neutral-950 border-neutral-800 text-white"
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-amber-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
                            {item.station}
                          </span>
                        </div>
                        <h4 className="text-lg font-black">{item.item_name}</h4>

                        {/* Modifiers highlighted in bold red text as per requirements */}
                        {item.modifiers ? (
                          <div className="bg-rose-950/80 border-2 border-rose-600 text-rose-300 font-extrabold px-3 py-1.5 rounded-xl text-sm inline-block shadow-[0_0_10px_rgba(225,29,72,0.2)]">
                            ⚠️ Note: {item.modifiers}
                          </div>
                        ) : null}
                      </div>

                      {/* Massive Touch-Friendly Action Button */}
                      <button
                        onClick={() =>
                          updateOrderItemStatus(
                            item.id,
                            item.status === "Ready" ? "Preparing" : "Ready"
                          )
                        }
                        className={`px-5 py-4 rounded-2xl font-black text-base border-3 flex items-center gap-2 transition-all shrink-0 active:scale-95 ${
                          item.status === "Ready"
                            ? "bg-emerald-500 border-emerald-400 text-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                            : "bg-neutral-800 hover:bg-neutral-700 border-neutral-600 text-white"
                        }`}
                      >
                        <Check className="w-6 h-6 stroke-[3]" />
                        {item.status === "Ready" ? "DONE" : "READY"}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Ticket Footer Status */}
                <div className="bg-neutral-950 p-4 border-t-4 border-neutral-800 text-center">
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    allItemsReady ? "text-emerald-400" : "text-amber-400 animate-pulse"
                  }`}>
                    {allItemsReady ? "✅ All Items Ready - Waiting for Table Pickup" : "🔥 Preparation In Progress"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
