"use client";

import { useRestaurantStore, Order } from "@/store/useRestaurantStore";
import { Clock, AlertTriangle, CheckCircle2, ChefHat, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

function OrderCard({ order }: { order: Order }) {
  const { updateOrderStatus } = useRestaurantStore();

  const isDelayed = order.elapsedTime > 600; // 10 minutes
  const isPreparing = order.status === "preparing";
  const isReady = order.status === "ready";

  const cardColor = cn(
    "flex flex-col rounded-xl border-2 transition-all duration-300 shadow-lg",
    isDelayed && isPreparing ? "border-red-500 bg-red-950/40" : 
    isPreparing ? "border-amber-500 bg-amber-950/40" : 
    "border-emerald-500 bg-emerald-950/40"
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cardColor}>
      <div className={cn(
        "px-4 py-3 border-b-2 flex justify-between items-center",
        isDelayed && isPreparing ? "border-red-500 bg-red-500/20" : 
        isPreparing ? "border-amber-500 bg-amber-500/20" : 
        "border-emerald-500 bg-emerald-500/20"
      )}>
        <h3 className="text-2xl font-bold font-mono">Table {order.tableId}</h3>
        <div className="flex items-center gap-2 font-mono text-xl">
          <Clock className="w-5 h-5" />
          <span className={cn("font-bold", isDelayed && isPreparing && "text-red-400 animate-pulse")}>
            {formatTime(order.elapsedTime)}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex-1">
        <ul className="space-y-3">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex justify-between items-center text-xl">
              <span className="font-semibold text-neutral-200">{item.name}</span>
              <span className="font-mono bg-neutral-800 px-3 py-1 rounded-md text-amber-500">x{item.quantity}</span>
            </li>
          ))}
        </ul>

        {order.specialRequest && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start gap-2 text-red-200">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <p className="text-sm font-medium leading-tight">{order.specialRequest}</p>
          </div>
        )}
      </div>

      <div className="p-4 pt-0 mt-auto">
        {isPreparing ? (
          <button 
            onClick={() => updateOrderStatus(order.id, "ready")}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xl rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-6 h-6" />
            Mark Ready
          </button>
        ) : isReady ? (
          <div className="w-full py-4 bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-bold text-xl rounded-lg flex items-center justify-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            Ready for Pickup
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function KDS() {
  const { orders } = useRestaurantStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Filter out delivered orders and sort: older orders first (descending elapsed time)
  const activeOrders = orders
    .filter(o => o.status !== "delivered")
    .sort((a, b) => b.elapsedTime - a.elapsedTime);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">KDS <span className="text-neutral-500 font-normal">| Kitchen Display</span></h1>
          </div>
        </div>
        <div className="flex gap-4 font-mono text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div> Delayed (&gt;10m)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div> Preparing
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Ready
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-x-auto">
        {activeOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-600">
            <ChefHat className="w-24 h-24 mb-4 opacity-20" />
            <p className="text-2xl font-semibold">No active orders</p>
            <p>Kitchen is clear</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max items-start">
            {activeOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
