"use client";

import { useRestaurantStore, TableStatus } from "@/store/useRestaurantStore";
import { ArrowLeft, LayoutDashboard, Users, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const STATUS_COLORS: Record<TableStatus, string> = {
  available: "bg-emerald-100 border-emerald-400 text-emerald-800",
  occupied: "bg-blue-100 border-blue-400 text-blue-800",
  waiting: "bg-yellow-100 border-yellow-400 text-yellow-800",
  ready: "bg-orange-100 border-orange-400 text-orange-800",
  clearing: "bg-red-100 border-red-400 text-red-800",
};

const STATUS_LABELS: Record<TableStatus, string> = {
  available: "Available",
  occupied: "Eating",
  waiting: "Waiting Food",
  ready: "Ready for Pickup",
  clearing: "Clearing",
};

export default function Manager() {
  const { tables, orders } = useRestaurantStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // KPI Calculations
  const totalOrders = orders.length;
  const readyOrders = orders.filter(o => o.status === "ready").length;
  const preparingOrders = orders.filter(o => o.status === "preparing").length;
  
  const avgWaitTime = orders.length > 0
    ? Math.round(orders.reduce((acc, curr) => acc + curr.elapsedTime, 0) / orders.length)
    : 0;

  const formatWaitTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return `${m}m ${seconds % 60}s`;
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-sm">
              <LayoutDashboard className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Manager Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* KPI Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-neutral-500 font-semibold">Total Orders</h3>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-4xl font-bold">{totalOrders}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-neutral-500 font-semibold">Queue (Preparing)</h3>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-4xl font-bold">{preparingOrders}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-neutral-500 font-semibold">Ready for Pickup</h3>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-4xl font-bold">{readyOrders}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-neutral-500 font-semibold">Avg. Wait Time</h3>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-4xl font-bold">{formatWaitTime(avgWaitTime)}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-neutral-200 text-sm font-semibold">
          <span className="text-neutral-500 uppercase tracking-wider mr-2">Status Map:</span>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-400"></div> Available</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-100 border border-blue-400"></div> Eating</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-400"></div> Waiting Food</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-orange-100 border border-orange-400"></div> Ready</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-100 border border-red-400"></div> Clearing</div>
        </div>

        {/* Table Heat Map */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
          <h2 className="text-xl font-bold mb-6">Live Table Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map(table => (
              <div 
                key={table.id} 
                className={cn(
                  "p-4 rounded-xl border-2 flex flex-col items-center justify-center min-h-[120px] transition-all",
                  STATUS_COLORS[table.status]
                )}
              >
                <span className="text-3xl font-bold mb-2">{table.number}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-center">{STATUS_LABELS[table.status]}</span>
                {table.status !== "available" && table.occupancyTime > 0 && (
                  <span className="text-xs mt-2 font-mono opacity-80">
                    {formatWaitTime(table.occupancyTime)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
