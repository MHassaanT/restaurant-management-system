import { create } from "zustand";
import { supabase, isSupabaseConfigured, fallbackRealtimeBus } from "@/lib/supabase";

export type TableStatus = "Available" | "Occupied" | "Waiting for Food" | "Clearing";
export type StationType = "BBQ" | "Fast Food" | "Drinks" | "Desi";
export type OrderStatus = "Pending" | "Preparing" | "Ready" | "Delivered";
export type ItemStatus = "Preparing" | "Ready";

export interface RestaurantTable {
  id: string;
  table_number: number;
  status: TableStatus;
  qr_token: string;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  station: StationType;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  modifiers: string;
  station: StationType;
  status: ItemStatus;
}

export interface Order {
  id: string;
  table_id: string;
  table_number?: number;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  items?: OrderItem[];
}

interface RestaurantState {
  tables: RestaurantTable[];
  menuItems: MenuItem[];
  orders: Order[];
  orderItems: OrderItem[];
  isLoading: boolean;

  // Actions
  fetchInitialData: () => Promise<void>;
  createTable: (tableNumber: number) => Promise<RestaurantTable>;
  submitOrder: (
    tableId: string,
    cart: { item: MenuItem; quantity: number; modifier: string }[]
  ) => Promise<string | null>;
  updateOrderItemStatus: (orderItemId: string, newStatus: ItemStatus) => Promise<void>;
  updateTableStatus: (tableId: string, status: TableStatus) => Promise<void>;
  initRealtimeSubscriptions: () => () => void;
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: "m1", name: "Seekh Kabab Plate", price: 1250, category: "BBQ", station: "BBQ" },
  { id: "m2", name: "Chicken Tikka Boti", price: 1450, category: "BBQ", station: "BBQ" },
  { id: "m3", name: "Mutton Ribs BBQ", price: 2200, category: "BBQ", station: "BBQ" },
  { id: "m4", name: "Smash Cheeseburger", price: 950, category: "Fast Food", station: "Fast Food" },
  { id: "m5", name: "Loaded Fries", price: 650, category: "Fast Food", station: "Fast Food" },
  { id: "m6", name: "Crispy Chicken Wings", price: 850, category: "Fast Food", station: "Fast Food" },
  { id: "m7", name: "Fresh Mango Lassi", price: 450, category: "Drinks", station: "Drinks" },
  { id: "m8", name: "Mint Lemonade", price: 350, category: "Drinks", station: "Drinks" },
  { id: "m9", name: "Karak Masala Chai", price: 250, category: "Drinks", station: "Drinks" },
  { id: "m10", name: "Chicken Karahi Special", price: 1850, category: "Desi", station: "Desi" },
  { id: "m11", name: "Chicken Biryani", price: 750, category: "Desi", station: "Desi" },
];

const INITIAL_TABLES: RestaurantTable[] = Array.from({ length: 6 }, (_, i) => {
  const num = i + 1;
  return {
    id: `tbl-${num}`,
    table_number: num,
    status: num === 2 ? "Occupied" : num === 4 ? "Waiting for Food" : "Available",
    qr_token: `token_table_${num}`,
  };
});

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  tables: INITIAL_TABLES,
  menuItems: DEFAULT_MENU_ITEMS,
  orders: [],
  orderItems: [],
  isLoading: false,

  fetchInitialData: async () => {
    set({ isLoading: true });
    if (isSupabaseConfigured && supabase) {
      try {
        const [tablesRes, menuRes, ordersRes, orderItemsRes] = await Promise.all([
          supabase.from("tables").select("*").order("table_number", { ascending: true }),
          supabase.from("menu_items").select("*"),
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
          supabase.from("order_items").select("*"),
        ]);

        if (tablesRes.data && tablesRes.data.length > 0) {
          set({ tables: tablesRes.data as RestaurantTable[] });
        }
        if (menuRes.data && menuRes.data.length > 0) {
          set({ menuItems: menuRes.data as MenuItem[] });
        }
        if (ordersRes.data) {
          set({ orders: ordersRes.data as Order[] });
        }
        if (orderItemsRes.data) {
          set({ orderItems: orderItemsRes.data as OrderItem[] });
        }
      } catch (err) {
        console.error("Error fetching Supabase initial data:", err);
      }
    }
    set({ isLoading: false });
  },

  createTable: async (tableNumber: number) => {
    const qr_token = `qr_tbl_${tableNumber}_${Math.random().toString(36).substring(2, 9)}`;
    const newTable: RestaurantTable = {
      id: isSupabaseConfigured ? undefined as any : `tbl-${tableNumber}-${Date.now()}`,
      table_number: tableNumber,
      status: "Available",
      qr_token,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("tables")
        .insert({ table_number: tableNumber, status: "Available", qr_token })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      const inserted = data as RestaurantTable;
      set((state) => ({ tables: [...state.tables.filter(t => t.table_number !== tableNumber), inserted] }));
      return inserted;
    } else {
      newTable.id = `tbl-${tableNumber}`;
      set((state) => {
        const filtered = state.tables.filter((t) => t.table_number !== tableNumber);
        return { tables: [...filtered, newTable] };
      });
      fallbackRealtimeBus.emit("tables_update", { action: "INSERT", table: newTable });
      return newTable;
    }
  },

  submitOrder: async (tableId, cart) => {
    const table = get().tables.find((t) => t.id === tableId || t.qr_token === tableId);
    if (!table) return null;

    let totalAmount = 0;
    cart.forEach((c) => {
      totalAmount += c.item.price * c.quantity;
    });

    const orderId = isSupabaseConfigured ? undefined as any : `ord-${Date.now()}`;
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      // 1. Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          table_id: table.id,
          status: "Pending",
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (orderError || !orderData) {
        console.error("Order creation failed:", orderError);
        return null;
      }

      const createdOrder = orderData as Order;

      // 2. Create order_items
      const itemRows: Omit<OrderItem, "id">[] = [];
      cart.forEach((c) => {
        for (let i = 0; i < c.quantity; i++) {
          itemRows.push({
            order_id: createdOrder.id,
            menu_item_id: c.item.id,
            item_name: c.item.name,
            modifiers: c.modifier || "",
            station: c.item.station,
            status: "Preparing",
          });
        }
      });

      const { data: insertedItems } = await supabase
        .from("order_items")
        .insert(itemRows)
        .select();

      // 3. Update table status to Occupied
      await supabase
        .from("tables")
        .update({ status: "Occupied" })
        .eq("id", table.id);

      // Local state sync
      set((state) => ({
        orders: [createdOrder, ...state.orders],
        orderItems: [...state.orderItems, ...(insertedItems as OrderItem[] || [])],
        tables: state.tables.map((t) => (t.id === table.id ? { ...t, status: "Occupied" } : t)),
      }));

      return createdOrder.id;
    } else {
      // Offline / Fallback mode
      const createdOrder: Order = {
        id: orderId,
        table_id: table.id,
        table_number: table.table_number,
        status: "Pending",
        total_amount: totalAmount,
        created_at: nowIso,
      };

      const newOrderItems: OrderItem[] = [];
      cart.forEach((c, idx) => {
        for (let i = 0; i < c.quantity; i++) {
          newOrderItems.push({
            id: `item-${Date.now()}-${idx}-${i}`,
            order_id: orderId,
            menu_item_id: c.item.id,
            item_name: c.item.name,
            modifiers: c.modifier || "",
            station: c.item.station,
            status: "Preparing",
          });
        }
      });

      set((state) => ({
        orders: [createdOrder, ...state.orders],
        orderItems: [...state.orderItems, ...newOrderItems],
        tables: state.tables.map((t) => (t.id === table.id ? { ...t, status: "Occupied" } : t)),
      }));

      fallbackRealtimeBus.emit("new_order", { order: createdOrder, items: newOrderItems, tableId: table.id });
      return orderId;
    }
  },

  updateOrderItemStatus: async (orderItemId, newStatus) => {
    let targetOrder: Order | undefined;
    let targetTableId: string | undefined;

    // Perform optimistic local update first
    set((state) => {
      const updatedItems = state.orderItems.map((item) =>
        item.id === orderItemId ? { ...item, status: newStatus } : item
      );

      const targetItem = state.orderItems.find((i) => i.id === orderItemId);
      if (!targetItem) return { orderItems: updatedItems };

      targetOrder = state.orders.find((o) => o.id === targetItem.order_id);
      if (!targetOrder) return { orderItems: updatedItems };

      // Check if all items in this order are Ready
      const orderItemsForThisOrder = updatedItems.filter((i) => i.order_id === targetOrder!.id);
      const allReady = orderItemsForThisOrder.every((i) => i.status === "Ready");

      let updatedOrders = state.orders;
      let updatedTables = state.tables;

      if (allReady && targetOrder.status !== "Ready") {
        updatedOrders = state.orders.map((o) =>
          o.id === targetOrder!.id ? { ...o, status: "Ready" } : o
        );
        targetTableId = targetOrder.table_id;
        updatedTables = state.tables.map((t) =>
          t.id === targetOrder!.table_id ? { ...t, status: "Waiting for Food" } : t
        );
      }

      return {
        orderItems: updatedItems,
        orders: updatedOrders,
        tables: updatedTables,
      };
    });

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("order_items")
        .update({ status: newStatus })
        .eq("id", orderItemId);

      if (targetOrder) {
        const state = get();
        const currentOrder = state.orders.find((o) => o.id === targetOrder!.id);
        if (currentOrder?.status === "Ready") {
          await supabase.from("orders").update({ status: "Ready" }).eq("id", targetOrder.id);
          if (targetTableId) {
            await supabase.from("tables").update({ status: "Waiting for Food" }).eq("id", targetTableId);
          }
        }
      }
    } else {
      fallbackRealtimeBus.emit("item_status_change", { orderItemId, newStatus, targetTableId });
    }
  },

  updateTableStatus: async (tableId, status) => {
    set((state) => ({
      tables: state.tables.map((t) => (t.id === tableId ? { ...t, status } : t)),
    }));

    if (isSupabaseConfigured && supabase) {
      await supabase.from("tables").update({ status }).eq("id", tableId);
    } else {
      fallbackRealtimeBus.emit("tables_update", { tableId, status });
    }
  },

  initRealtimeSubscriptions: () => {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel("restaurant-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tables" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              set((s) => ({ tables: [...s.tables.filter((t) => t.id !== payload.new.id), payload.new as RestaurantTable] }));
            } else if (payload.eventType === "UPDATE") {
              set((s) => ({
                tables: s.tables.map((t) => (t.id === payload.new.id ? (payload.new as RestaurantTable) : t)),
              }));
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              set((s) => ({ orders: [payload.new as Order, ...s.orders] }));
            } else if (payload.eventType === "UPDATE") {
              set((s) => ({
                orders: s.orders.map((o) => (o.id === payload.new.id ? (payload.new as Order) : o)),
              }));
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "order_items" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              set((s) => ({ orderItems: [...s.orderItems, payload.new as OrderItem] }));
            } else if (payload.eventType === "UPDATE") {
              set((s) => ({
                orderItems: s.orderItems.map((i) => (i.id === payload.new.id ? (payload.new as OrderItem) : i)),
              }));
            }
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    } else {
      // Fallback Bus Listener for single-tab or cross-component sync
      const unsubNewOrder = fallbackRealtimeBus.on("new_order", () => {
        // Force refresh from store state
        set((s) => ({ ...s }));
      });
      const unsubItemStatus = fallbackRealtimeBus.on("item_status_change", () => {
        set((s) => ({ ...s }));
      });
      const unsubTables = fallbackRealtimeBus.on("tables_update", () => {
        set((s) => ({ ...s }));
      });

      return () => {
        unsubNewOrder();
        unsubItemStatus();
        unsubTables();
      };
    }
  },
}));
