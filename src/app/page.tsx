"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { Play, Square, Utensils, ChefHat, LayoutDashboard } from "lucide-react";

export default function Home() {
  const { demoMode, setDemoMode, initializeDemoData } = useRestaurantStore();

  const toggleSimulation = () => {
    if (!demoMode) {
      initializeDemoData();
      setDemoMode(true);
    } else {
      setDemoMode(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tighter text-amber-500">NAAR</h1>
          <p className="text-xl text-neutral-400">Fine Dining Restaurant Management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/kds" className="group">
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl hover:border-amber-500 hover:bg-neutral-800 transition-all duration-300 flex flex-col items-center gap-4">
              <ChefHat className="w-12 h-12 text-amber-500 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-semibold">Kitchen Display</h2>
              <p className="text-sm text-neutral-500 text-center">Tablet view for back of house</p>
            </div>
          </Link>
          
          <Link href="/waiter" className="group">
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl hover:border-amber-500 hover:bg-neutral-800 transition-all duration-300 flex flex-col items-center gap-4">
              <Utensils className="w-12 h-12 text-amber-500 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-semibold">Waiter Entry</h2>
              <p className="text-sm text-neutral-500 text-center">Mobile order entry system</p>
            </div>
          </Link>

          <Link href="/manager" className="group">
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl hover:border-amber-500 hover:bg-neutral-800 transition-all duration-300 flex flex-col items-center gap-4">
              <LayoutDashboard className="w-12 h-12 text-amber-500 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-semibold">Manager Dashboard</h2>
              <p className="text-sm text-neutral-500 text-center">Live oversight & metrics</p>
            </div>
          </Link>
        </div>

        <div className="pt-12 border-t border-neutral-800">
          <button
            onClick={toggleSimulation}
            className={`px-8 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-3 mx-auto transition-all ${
              demoMode 
                ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                : "bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            }`}
          >
            {demoMode ? (
              <>
                <Square className="w-5 h-5 fill-current" />
                Stop Demo Simulation
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Start Demo Mode
              </>
            )}
          </button>
          <p className="mt-4 text-sm text-neutral-500">
            {demoMode ? "Simulation active: firing fake orders every 15s" : "Click to pre-load sample data and simulate live orders"}
          </p>
        </div>
      </div>
    </main>
  );
}
