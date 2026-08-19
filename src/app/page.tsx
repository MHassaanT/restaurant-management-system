"use client";

import Link from "next/link";
import { 
  ChefHat, 
  LayoutDashboard, 
  QrCode, 
  Sparkles, 
  Utensils,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="max-w-4xl w-full text-center space-y-12">
        {/* Brand Banner */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-950/80 border-2 border-amber-500 text-amber-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Real-Time Order Routing System
          </div>
          <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-white">
            NAAR <span className="text-amber-500">MANAGEMENT</span>
          </h1>
          <p className="text-xl text-neutral-400 font-medium max-w-xl mx-auto">
            High-fidelity prototype for tablet staff displays, real-time kitchen routing, and customer QR menus.
          </p>
        </div>

        {/* Core Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Management & Setup */}
          <Link href="/management" className="group">
            <div className="h-full bg-neutral-900 border-4 border-neutral-800 p-8 rounded-3xl group-hover:border-amber-500 group-hover:bg-neutral-800/80 transition-all duration-300 flex flex-col justify-between gap-6 shadow-2xl">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl border-2 border-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-white">Management Map</h2>
                <p className="text-sm text-neutral-400 leading-relaxed font-medium">
                  Live table map with real-time status color updates, table creation, and QR code token generation.
                </p>
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm group-hover:translate-x-1 transition-transform">
                <span>Launch Management</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </div>
            </div>
          </Link>

          {/* Kitchen Display System */}
          <Link href="/kds" className="group">
            <div className="h-full bg-neutral-900 border-4 border-neutral-800 p-8 rounded-3xl group-hover:border-amber-500 group-hover:bg-neutral-800/80 transition-all duration-300 flex flex-col justify-between gap-6 shadow-2xl">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl border-2 border-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ChefHat className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-white">Kitchen Display</h2>
                <p className="text-sm text-neutral-400 leading-relaxed font-medium">
                  Tablet landscape KDS view with station filters (BBQ, Fast Food, Drinks), real-time ticket popups, and bold modifier warnings.
                </p>
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm group-hover:translate-x-1 transition-transform">
                <span>Launch KDS Tablet</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </div>
            </div>
          </Link>

          {/* Customer QR Menu */}
          <Link href="/menu?table=token_table_1" className="group">
            <div className="h-full bg-neutral-900 border-4 border-neutral-800 p-8 rounded-3xl group-hover:border-amber-500 group-hover:bg-neutral-800/80 transition-all duration-300 flex flex-col justify-between gap-6 shadow-2xl">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl border-2 border-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <QrCode className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-white">Customer QR Menu</h2>
                <p className="text-sm text-neutral-400 leading-relaxed font-medium">
                  Mobile optimized menu ordering experience with active table session locks, item modifiers, and instant cart submission.
                </p>
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm group-hover:translate-x-1 transition-transform">
                <span>Demo QR Menu</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </div>
            </div>
          </Link>

        </div>

        {/* Footer info */}
        <div className="pt-8 border-t-2 border-neutral-900 flex items-center justify-center gap-3 text-xs text-neutral-500 font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Next.js App Router • Tailwind CSS • Supabase Realtime</span>
        </div>
      </div>
    </main>
  );
}
