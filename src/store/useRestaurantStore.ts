import { create } from "zustand";

export type OrderStatus = "preparing" | "ready" | "delivered";
export type TableStatus = "available" | "occupied" | "waiting" | "ready" | "clearing";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  tableId: number;
  items: OrderItem[];
  status: OrderStatus;
  specialRequest?: string;
  timestamp: number;
  elapsedTime: number; // in seconds
}

export interface Table {
  id: number;
  number: number;
  status: TableStatus;
  currentOrderId?: string;
  occupancyTime: number; // in seconds
}

interface RestaurantState {
  orders: Order[];
  tables: Table[];
  demoMode: boolean;
  addOrder: (order: Omit<Order, "id" | "timestamp" | "elapsedTime">) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateTableStatus: (tableId: number, status: TableStatus) => void;
  setDemoMode: (active: boolean) => void;
  simulateOrder: () => void;
  initializeDemoData: () => void;
  tickTime: () => void;
}

const MENU_ITEMS = ["Biryani", "Karahi", "Seekh", "Samosa", "Chai", "Lassi"];

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  orders: [],
  tables: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    status: "available",
    occupancyTime: 0,
  })),
  demoMode: false,

  addOrder: (orderData) => {
    const newOrder: Order = {
      ...orderData,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      elapsedTime: 0,
    };
    
    set((state) => ({
      orders: [...state.orders, newOrder],
      tables: state.tables.map((t) =>
        t.id === orderData.tableId
          ? { ...t, status: "waiting", currentOrderId: newOrder.id }
          : t
      ),
    }));
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => {
      const updatedOrders = state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
      
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return { orders: updatedOrders };

      let tableStatus: TableStatus = "waiting";
      if (status === "ready") tableStatus = "ready";
      if (status === "delivered") tableStatus = "occupied";

      return {
        orders: updatedOrders,
        tables: state.tables.map((t) =>
          t.id === order.tableId ? { ...t, status: tableStatus } : t
        ),
      };
    });
  },

  updateTableStatus: (tableId, status) => {
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status } : t
      ),
    }));
  },

  setDemoMode: (active) => set({ demoMode: active }),

  simulateOrder: () => {
    const state = get();
    const availableTables = state.tables.filter((t) => t.status === "available");
    if (availableTables.length === 0) return;
    
    const randomTable = availableTables[Math.floor(Math.random() * availableTables.length)];
    const randomItem = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
    
    get().addOrder({
      tableId: randomTable.id,
      items: [{ id: "1", name: randomItem, quantity: 1 }],
      status: "preparing",
    });
  },

  initializeDemoData: () => {
    const now = Date.now();
    const demoOrders: Order[] = [
      {
        id: "demo-1",
        tableId: 5,
        items: [{ id: "i1", name: "Biryani", quantity: 2 }],
        status: "preparing",
        timestamp: now - 600000, // 10 mins ago (delayed)
        elapsedTime: 600,
      },
      {
        id: "demo-2",
        tableId: 2,
        items: [{ id: "i2", name: "Karahi", quantity: 1 }],
        status: "ready",
        specialRequest: "Extra spicy please",
        timestamp: now - 120000,
        elapsedTime: 120,
      },
      {
        id: "demo-3",
        tableId: 8,
        items: [{ id: "i3", name: "Seekh", quantity: 3 }, { id: "i4", name: "Chai", quantity: 3 }],
        status: "preparing",
        timestamp: now - 60000,
        elapsedTime: 60,
      },
      {
        id: "demo-4",
        tableId: 1,
        items: [{ id: "i5", name: "Samosa", quantity: 5 }],
        status: "preparing",
        timestamp: now - 30000,
        elapsedTime: 30,
      },
      {
        id: "demo-5",
        tableId: 12,
        items: [{ id: "i6", name: "Lassi", quantity: 2 }],
        status: "preparing",
        timestamp: now - 15000,
        elapsedTime: 15,
      },
      {
        id: "demo-6",
        tableId: 15,
        items: [{ id: "i7", name: "Biryani", quantity: 1 }],
        status: "preparing",
        timestamp: now - 5000,
        elapsedTime: 5,
      },
    ];

    set((state) => {
      const newTables = [...state.tables];
      demoOrders.forEach(o => {
        const t = newTables.find(t => t.id === o.tableId);
        if (t) {
          t.status = o.status === "ready" ? "ready" : "waiting";
          t.currentOrderId = o.id;
          t.occupancyTime = o.elapsedTime + 600; // random occupancy
        }
      });
      // Set some tables as just occupied
      newTables[0].status = "occupied";
      newTables[3].status = "clearing";

      return { orders: demoOrders, tables: newTables, demoMode: true };
    });
  },

  tickTime: () => {
    set((state) => ({
      orders: state.orders.map((o) => ({
        ...o,
        elapsedTime: o.status !== "delivered" ? Math.floor((Date.now() - o.timestamp) / 1000) : o.elapsedTime,
      })),
      tables: state.tables.map((t) => ({
        ...t,
        occupancyTime: t.status !== "available" ? t.occupancyTime + 1 : 0,
      }))
    }));
  }
}));
