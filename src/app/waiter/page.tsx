"use client";

import { useRestaurantStore, OrderItem } from "@/store/useRestaurantStore";
import { ArrowLeft, Send, Utensils, BellRing, Check, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const MENU = [
  { id: "m1", name: "Biryani", color: "bg-orange-500 text-white" },
  { id: "m2", name: "Karahi", color: "bg-red-600 text-white" },
  { id: "m3", name: "Seekh", color: "bg-amber-700 text-white" },
  { id: "m4", name: "Samosa", color: "bg-yellow-500 text-black" },
  { id: "m5", name: "Chai", color: "bg-amber-900 text-white" },
  { id: "m6", name: "Lassi", color: "bg-blue-100 text-blue-900" },
];

export default function Waiter() {
  const { addOrder, orders, updateOrderStatus } = useRestaurantStore();
  const [table, setTable] = useState<number>(1);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [specialReq, setSpecialReq] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const readyOrders = orders.filter(o => o.status === "ready");

  const addToCart = (item: typeof MENU[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.name === item.name);
      if (existing) {
        return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, quantity: 1 }];
    });
  };

  const removeFromCart = (name: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.name === name);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.name === name ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.name !== name);
    });
  };

  const handleSend = () => {
    if (cart.length === 0) return;
    addOrder({
      tableId: table,
      items: cart,
      status: "preparing",
      specialRequest: specialReq || undefined,
    });
    setCart([]);
    setSpecialReq("");
    setIsSent(true);
    setTimeout(() => setIsSent(false), 2000);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col pb-24">
      <header className="bg-white shadow-sm border-b p-4 sticky top-0 z-10 flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-600" />
            Order Entry
          </h1>
        </div>
      </header>

      {/* Notifications for ready orders */}
      {readyOrders.length > 0 && (
        <div className="bg-amber-100 border-l-4 border-amber-500 p-4 m-4 rounded shadow-sm">
          <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
            <BellRing className="w-5 h-5" />
            Orders Ready for Pickup!
          </div>
          <div className="space-y-2">
            {readyOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between bg-white p-3 rounded border border-amber-200">
                <span className="font-bold">Table {o.tableId}</span>
                <button 
                  onClick={() => updateOrderStatus(o.id, "delivered")}
                  className="px-4 py-2 bg-emerald-500 text-white font-bold rounded shadow hover:bg-emerald-600 active:scale-95 transition-all"
                >
                  Delivered
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 p-4 space-y-6 max-w-md mx-auto w-full">
        {/* Table Selector */}
        <div className="space-y-2">
          <label className="font-bold text-lg">Table Number</label>
          <select 
            value={table} 
            onChange={(e) => setTable(Number(e.target.value))}
            className="w-full p-4 text-xl rounded-xl border-2 border-neutral-300 bg-white font-bold focus:border-amber-500 focus:ring-0 outline-none"
          >
            {Array.from({ length: 20 }, (_, i) => (
              <option key={i+1} value={i+1}>Table {i+1}</option>
            ))}
          </select>
        </div>

        {/* Menu Grid */}
        <div className="space-y-2">
          <label className="font-bold text-lg">Quick Menu</label>
          <div className="grid grid-cols-2 gap-3">
            {MENU.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className={cn(
                  "p-6 rounded-xl font-bold text-xl shadow-sm active:scale-95 transition-transform flex flex-col items-center justify-center min-h-[100px]",
                  item.color
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Order List */}
        {cart.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Current Order</h3>
            <ul className="space-y-3">
              {cart.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-lg">
                  <span className="font-semibold">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeFromCart(item.name)} className="w-8 h-8 flex items-center justify-center bg-neutral-200 rounded-full active:bg-neutral-300">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => addToCart({ id: item.id, name: item.name, color: "" })} className="w-8 h-8 flex items-center justify-center bg-neutral-200 rounded-full active:bg-neutral-300">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <textarea
              placeholder="Add Special Request (e.g. Extra spicy, allergies...)"
              value={specialReq}
              onChange={(e) => setSpecialReq(e.target.value)}
              className="w-full p-3 rounded-lg border border-neutral-300 min-h-[80px] text-base focus:border-amber-500 outline-none"
            />
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center pb-8 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleSend}
          disabled={cart.length === 0 || isSent}
          className={cn(
            "w-full max-w-md py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95",
            isSent 
              ? "bg-emerald-500 text-white" 
              : cart.length > 0 
                ? "bg-amber-500 hover:bg-amber-400 text-black" 
                : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
          )}
        >
          {isSent ? (
            <>
              <Check className="w-6 h-6" />
              Order Sent!
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              Send to Kitchen
            </>
          )}
        </button>
      </div>
    </div>
  );
}
