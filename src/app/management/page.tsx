"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRestaurantStore, TableStatus } from "@/store/useRestaurantStore";
import { isSupabaseConfigured } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { 
  Plus, 
  QrCode, 
  RefreshCw, 
  ChefHat, 
  Utensils, 
  CheckCircle2, 
  AlertCircle,
  Wifi,
  WifiOff,
  ArrowLeft,
  X,
  Printer
} from "lucide-react";

export default function ManagementDashboard() {
  const { tables, fetchInitialData, createTable, updateTableStatus, initRealtimeSubscriptions, isLoading } = useRestaurantStore();
  const [newTableNum, setNewTableNum] = useState<string>("");
  const [selectedQRTable, setSelectedQRTable] = useState<{ tableNumber: number; token: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchInitialData();
    const unsubscribe = initRealtimeSubscriptions();
    return () => {
      unsubscribe();
    };
  }, [fetchInitialData, initRealtimeSubscriptions]);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const num = parseInt(newTableNum, 10);
    if (isNaN(num) || num <= 0) {
      setErrorMsg("Please enter a valid table number (positive integer)");
      return;
    }

    if (tables.some((t) => t.table_number === num)) {
      setErrorMsg(`Table #${num} already exists!`);
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createTable(num);
      setNewTableNum("");
      setSelectedQRTable({
        tableNumber: created.table_number,
        token: created.qr_token,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create table");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeStyle = (status: TableStatus) => {
    switch (status) {
      case "Available":
        return "bg-emerald-600 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
      case "Occupied":
        return "bg-rose-600 border-rose-400 text-rose-100 shadow-[0_0_15px_rgba(225,29,72,0.3)]";
      case "Waiting for Food":
        return "bg-amber-500 border-amber-300 text-amber-950 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse";
      case "Clearing":
        return "bg-purple-600 border-purple-400 text-purple-100 shadow-[0_0_15px_rgba(147,51,234,0.3)]";
      default:
        return "bg-neutral-800 border-neutral-700 text-neutral-300";
    }
  };

  const getOriginUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-8 flex flex-col gap-8">
      {/* Top Bar Navigation */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 border-4 border-neutral-800 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-2xl border-2 border-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-amber-500" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Management & Setup Dashboard
            </h1>
            <p className="text-sm md:text-base text-neutral-400 font-medium mt-1">
              Live Table Map & QR Generation Center
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${
            isSupabaseConfigured 
              ? "bg-emerald-950/80 border-emerald-500 text-emerald-400" 
              : "bg-amber-950/80 border-amber-500 text-amber-400"
          }`}>
            {isSupabaseConfigured ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
            {isSupabaseConfigured ? "Supabase Realtime Live" : "Offline Demo Realtime"}
          </span>

          <Link
            href="/kds"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded-2xl border-2 border-amber-400 flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
          >
            <ChefHat className="w-5 h-5" />
            Open KDS
          </Link>
        </div>
      </header>

      {/* Main Content Grid: Table Creation + Live Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form & Legend */}
        <section className="space-y-6">
          <div className="bg-neutral-900 border-4 border-neutral-800 p-6 rounded-3xl space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Plus className="w-6 h-6 text-amber-500" />
              Generate New Table
            </h2>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase text-neutral-400 mb-2">
                  Table Number
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 11"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  className="w-full bg-neutral-950 border-3 border-neutral-700 focus:border-amber-500 text-white font-black text-2xl p-4 rounded-2xl outline-none transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="bg-rose-950/80 border-2 border-rose-600 text-rose-300 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !newTableNum}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 text-xl font-black py-4 px-6 rounded-2xl border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-3"
              >
                {isSubmitting ? <RefreshCw className="w-6 h-6 animate-spin" /> : <QrCode className="w-6 h-6" />}
                Generate QR Token & Table
              </button>
            </form>
          </div>

          {/* Color Status Legend */}
          <div className="bg-neutral-900 border-4 border-neutral-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              Live Map Legend
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm font-extrabold">
              <div className="flex items-center gap-3 p-3 bg-emerald-950/60 border-2 border-emerald-500 rounded-xl text-emerald-300">
                <span className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></span>
                Green = Available
              </div>
              <div className="flex items-center gap-3 p-3 bg-rose-950/60 border-2 border-rose-500 rounded-xl text-rose-300">
                <span className="w-4 h-4 rounded-full bg-rose-500"></span>
                Red = Occupied
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-950/60 border-2 border-amber-500 rounded-xl text-amber-300">
                <span className="w-4 h-4 rounded-full bg-amber-500 animate-bounce"></span>
                Yellow = Food Ready
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-950/60 border-2 border-purple-500 rounded-xl text-purple-300">
                <span className="w-4 h-4 rounded-full bg-purple-500"></span>
                Purple = Clearing
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Live Table Map Grid */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-900 border-4 border-neutral-800 p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Utensils className="w-6 h-6 text-amber-500" />
                Live Table Map ({tables.length} Total)
              </h2>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-700">
                Realtime Auto-Sync Enabled
              </span>
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {tables.map((table) => (
                <div
                  key={table.id || table.table_number}
                  className={`p-6 rounded-3xl border-4 transition-all duration-300 flex flex-col justify-between gap-6 ${getStatusBadgeStyle(
                    table.status
                  )}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs uppercase font-extrabold tracking-widest opacity-80">
                        Table Number
                      </span>
                      <h3 className="text-4xl font-black tracking-tight">
                        #{table.table_number}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black/30 border border-white/20">
                      {table.status}
                    </span>
                  </div>

                  {/* Actions & QR Modal Trigger */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() =>
                        setSelectedQRTable({
                          tableNumber: table.table_number,
                          token: table.qr_token,
                        })
                      }
                      className="w-full py-3 bg-black/40 hover:bg-black/60 text-white font-bold rounded-2xl border-2 border-white/30 flex items-center justify-center gap-2 text-sm transition-colors"
                    >
                      <QrCode className="w-5 h-5 text-amber-400" />
                      View QR Code
                    </button>

                    {/* Quick Status Override Selector */}
                    <select
                      value={table.status}
                      onChange={(e) => updateTableStatus(table.id, e.target.value as TableStatus)}
                      className="w-full bg-black/50 border-2 border-white/20 text-white font-bold text-xs py-2 px-3 rounded-xl outline-none cursor-pointer hover:bg-black/70"
                    >
                      <option value="Available">Set Available (Green)</option>
                      <option value="Occupied">Set Occupied (Red)</option>
                      <option value="Waiting for Food">Set Food Ready (Yellow)</option>
                      <option value="Clearing">Set Clearing (Purple)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* QR Display Modal */}
      {selectedQRTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-4 border-amber-500 p-8 rounded-3xl max-w-md w-full text-center space-y-6 relative shadow-[0_0_50px_rgba(245,158,11,0.3)]">
            <button
              onClick={() => setSelectedQRTable(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white bg-neutral-800 rounded-full border border-neutral-700"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white">
                Table #{selectedQRTable.tableNumber} QR Code
              </h3>
              <p className="text-sm text-neutral-400 font-medium">
                Scan with any mobile camera to launch customer menu
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl flex justify-center items-center shadow-inner inline-block mx-auto border-4 border-neutral-300">
              <QRCodeSVG
                value={`${getOriginUrl()}/menu?table=${selectedQRTable.token}`}
                size={220}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border-2 border-neutral-800 text-left space-y-1">
              <span className="text-xs font-bold text-neutral-500 uppercase">Target URL</span>
              <p className="text-xs font-mono text-amber-400 truncate">
                {getOriginUrl()}/menu?table={selectedQRTable.token}
              </p>
            </div>

            <div className="flex gap-3">
              <a
                href={`/menu?table=${selectedQRTable.token}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold py-3.5 px-4 rounded-2xl border-2 border-amber-400 text-sm flex items-center justify-center gap-2"
              >
                Test Menu Route
              </a>
              <button
                onClick={() => window.print()}
                className="bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold p-3.5 rounded-2xl border-2 border-neutral-700 flex items-center justify-center"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
