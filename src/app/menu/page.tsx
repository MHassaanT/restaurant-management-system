"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRestaurantStore, MenuItem } from "@/store/useRestaurantStore";
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Lock, 
  CheckCircle2, 
  Utensils, 
  Sparkles,
  ArrowRight,
  MessageSquare
} from "lucide-react";

interface CartItem {
  item: MenuItem;
  quantity: number;
  modifier: string;
}

function MenuContent() {
  const searchParams = useSearchParams();
  const tableToken = searchParams.get("table") || "";

  const { tables, menuItems, fetchInitialData, submitOrder, initRealtimeSubscriptions } = useRestaurantStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeModifierModal, setActiveModifierModal] = useState<MenuItem | null>(null);
  const [currentModifierText, setCurrentModifierText] = useState<string>("");
  const [orderSubmittedId, setOrderSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
    const unsub = initRealtimeSubscriptions();
    return () => unsub();
  }, [fetchInitialData, initRealtimeSubscriptions]);

  // Find table matching token
  const currentTable = tables.find((t) => t.qr_token === tableToken || t.id === tableToken);

  // If table status is NOT Available, lock the session!
  const isLocked = currentTable ? currentTable.status !== "Available" : false;

  const categories = ["All", ...Array.from(new Set(menuItems.map((m) => m.category)))];

  const filteredMenuItems = selectedCategory === "All"
    ? menuItems
    : menuItems.filter((m) => m.category === selectedCategory);

  const handleAddToCart = (item: MenuItem, modifier = "") => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (c) => c.item.id === item.id && c.modifier === modifier
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prevCart, { item, quantity: 1, modifier }];
    });
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      updated[index].quantity += delta;
      if (updated[index].quantity <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      return updated;
    });
  };

  const handleConfirmModifier = () => {
    if (activeModifierModal) {
      handleAddToCart(activeModifierModal, currentModifierText);
      setActiveModifierModal(null);
      setCurrentModifierText("");
    }
  };

  const handleOrderSubmit = async () => {
    if (!currentTable || cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const orderId = await submitOrder(currentTable.qr_token, cart);
      if (orderId) {
        setOrderSubmittedId(orderId);
        setCart([]);
      }
    } catch (err) {
      console.error("Order submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCartPrice = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  if (orderSubmittedId) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full border-4 border-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white">
            Order Sent to Kitchen!
          </h1>
          <p className="text-lg text-neutral-400 font-medium max-w-sm">
            Table #{currentTable?.table_number} is now active. Your fresh meal is being prepared right away!
          </p>
        </div>
        <div className="bg-neutral-900 border-2 border-neutral-800 p-4 rounded-2xl text-sm font-mono text-amber-400">
          Order ID: {orderSubmittedId}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-32">
      {/* Table Header */}
      <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b-4 border-neutral-800 p-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500 text-neutral-950 rounded-2xl font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            #{currentTable?.table_number || "?"}
          </div>
          <div>
            <h1 className="text-xl font-black text-white">NAAR Fine Dining</h1>
            <p className="text-xs text-neutral-400 font-semibold">
              {currentTable ? `Table #${currentTable.table_number}` : "Invalid Table Token"}
            </p>
          </div>
        </div>

        {currentTable && (
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
              isLocked
                ? "bg-rose-950/80 border-rose-500 text-rose-300"
                : "bg-emerald-950/80 border-emerald-500 text-emerald-300"
            }`}
          >
            {currentTable.status}
          </span>
        )}
      </header>

      {/* SESSION LOCK SCREEN */}
      {isLocked ? (
        <div className="p-6 max-w-md mx-auto my-12 text-center space-y-6">
          <div className="bg-rose-950/80 border-4 border-rose-600 p-8 rounded-3xl space-y-6 shadow-[0_0_40px_rgba(225,29,72,0.3)]">
            <div className="w-20 h-20 bg-rose-900 text-rose-400 rounded-2xl mx-auto flex items-center justify-center border-2 border-rose-500">
              <Lock className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">Table Is Active</h2>
              <p className="text-neutral-300 font-medium text-base">
                Table #{currentTable?.table_number} is currently marked as{" "}
                <span className="font-bold text-rose-400">"{currentTable?.status}"</span>.
              </p>
            </div>
            <p className="text-xs text-neutral-400">
              Additional QR orders are locked to prevent unauthorized order spam. Please speak with your waiter or manager if you need further assistance.
            </p>
          </div>
        </div>
      ) : (
        /* MENU & ORDERING INTERFACE */
        <main className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-3 rounded-2xl font-extrabold text-sm whitespace-nowrap transition-all border-2 ${
                  selectedCategory === cat
                    ? "bg-amber-500 border-amber-400 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items List */}
          <div className="space-y-4">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="bg-neutral-900 border-3 border-neutral-800 p-5 rounded-3xl flex items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-amber-500 tracking-wider bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-800">
                      {item.station}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">{item.name}</h3>
                  <p className="text-amber-400 font-black text-base">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveModifierModal(item);
                      setCurrentModifierText("");
                    }}
                    className="p-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-2xl border-2 border-neutral-700 text-xs flex items-center gap-1"
                    title="Add custom instructions"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    Custom
                  </button>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="p-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black rounded-2xl border-2 border-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    <Plus className="w-5 h-5 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Floating Bottom Cart Bar */}
      {!isLocked && cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-neutral-900/95 backdrop-blur-lg border-t-4 border-amber-500 p-4 sm:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Cart Items Summary Preview */}
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {cart.map((c, idx) => (
                <div
                  key={`${c.item.id}-${idx}`}
                  className="flex items-center justify-between text-xs bg-neutral-950 p-2.5 rounded-xl border border-neutral-800"
                >
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-white">
                      {c.quantity}x {c.item.name}
                    </span>
                    {c.modifier && (
                      <p className="text-rose-400 font-bold italic">"{c.modifier}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">
                      ${(c.item.price * c.quantity).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-1">
                      <button
                        onClick={() => handleUpdateQuantity(idx, -1)}
                        className="p-1 hover:text-rose-400"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-1 font-extrabold">{c.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(idx, 1)}
                        className="p-1 hover:text-emerald-400"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Action Button */}
            <button
              onClick={handleOrderSubmit}
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xl font-black py-4 px-6 rounded-2xl border-2 border-amber-400 flex items-center justify-between shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6" />
                <span>Submit Order ({cart.reduce((s, c) => s + c.quantity, 0)} Items)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>${totalCartPrice.toFixed(2)}</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Item Modifier Modal */}
      {activeModifierModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-4 border-amber-500 p-6 rounded-3xl max-w-md w-full space-y-6">
            <h3 className="text-2xl font-extrabold text-white">
              Customize {activeModifierModal.name}
            </h3>
            <div>
              <label className="block text-xs font-extrabold uppercase text-neutral-400 mb-2">
                Special Instructions / Custom Modifier
              </label>
              <input
                type="text"
                placeholder='e.g., "no mayo", "extra spicy", "no onion"'
                value={currentModifierText}
                onChange={(e) => setCurrentModifierText(e.target.value)}
                className="w-full bg-neutral-950 border-2 border-neutral-700 text-white font-bold p-4 rounded-2xl outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveModifierModal(null)}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 font-bold rounded-2xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModifier}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold rounded-2xl text-sm"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerMenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-xl font-bold text-amber-500 animate-pulse">Loading Customer Menu...</p>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
