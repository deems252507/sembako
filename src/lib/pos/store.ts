import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, StoreSnapshot } from "./types";
import { loadStore } from "./actions";

type Status = "idle" | "loading" | "ready" | "error";

type PosState = StoreSnapshot & {
  status: Status;
  loadedFor: string | null;
  error: string | null;
  cart: CartItem[];
  hydrate: (snap: StoreSnapshot, userId: string) => void;
  bootstrap: (userId: string) => Promise<void>;
  apply: (snap: StoreSnapshot) => void;
  addToCart: (product: Product, qty?: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  updateCartPrice: (productId: string, price: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

const emptySnap = (): StoreSnapshot => ({
  profile: {
    userId: "",
    storeName: "",
    slogan: "Kelola bisnis Anda dengan lebih mudah",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    footerReceipt: "Terima kasih telah berbelanja!",
    logo: null,
    cashBalance: 0,
  },
  products: [],
  customers: [],
  suppliers: [],
  purchases: [],
  sales: [],
  cashEntries: [],
  staff: [],
  shifts: [],
  stockLogs: [],
});

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      ...emptySnap(),
      status: "idle",
      loadedFor: null,
      error: null,
      cart: [],
      hydrate: (snap, userId) => set({ ...snap, status: "ready", loadedFor: userId, error: null }),
      apply: (snap) => set({ ...snap, status: "ready", error: null }),
      bootstrap: async (userId) => {
        if (get().loadedFor === userId && get().status === "ready") return;
        set({ status: "loading", error: null });
        try {
          const snap = await loadStore();
          set({ ...snap, status: "ready", loadedFor: userId, error: null });
        } catch (err) {
          set({
            status: "error",
            error: err instanceof Error ? err.message : "Gagal memuat toko",
          });
        }
      },
      addToCart: (product, qty = 1) =>
        set((state) => {
          const existing = state.cart.find((c) => c.product.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.product.id === product.id ? { ...c, qty: c.qty + qty } : c,
              ),
            };
          }
          return { cart: [...state.cart, { product, qty, discount: 0 }] };
        }),
      updateCartQty: (productId, qty) =>
        set((state) => ({
          cart:
            qty <= 0
              ? state.cart.filter((c) => c.product.id !== productId)
              : state.cart.map((c) => (c.product.id === productId ? { ...c, qty } : c)),
        })),
      updateCartPrice: (productId, price) =>
        set((state) => ({
          cart: state.cart.map((c) =>
            c.product.id === productId
              ? { ...c, product: { ...c.product, sellPrice: price } }
              : c,
          ),
        })),
      removeFromCart: (productId) =>
        set((state) => ({ cart: state.cart.filter((c) => c.product.id !== productId) })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "makmur-cart-v1",
      partialize: (s) => ({ cart: s.cart }),
    },
  ),
);
