"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, CartItem, Transaction, StoreSettings, User } from "@/types";
import { products as initialProducts, storeSettings as initialSettings, currentUser as initialUser } from "@/lib/mock-data";

interface Customer {
  id: string;
  name: string;
  phone: string;
  totalBelanja: number;
  totalHutang: number;
  sisaHutang: number;
}

interface Supplier {
  id: string;
  name: string;
  phone: string;
  totalPembelian: number;
  hutang: number;
}

interface AppState {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  resetStoreSettings: () => void;

  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  transactions: Transaction[];
  createTransaction: (paymentMethod: "tunai" | "qris" | "transfer", amountPaid: number) => Transaction | null;

  customers: Customer[];
  addCustomer: (name: string, phone: string) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  suppliers: Supplier[];
  addSupplier: (name: string, phone: string) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  purchases: { id: string; date: string; supplier: string; total: number; status: string }[];
  addPurchase: (supplier: string, total: number, status: string, items: { productId: string; qty: number; price: number }[]) => void;

  cashBalance: number;
  cashTransactions: { id: string; date: string; keterangan: string; jenis: "masuk" | "keluar"; jumlah: number }[];
  addCashTransaction: (keterangan: string, jenis: "masuk" | "keluar", jumlah: number) => void;

  currentShift: { openedAt: string; initialCash: number; status: "open" | "closed" } | null;
  openShift: (initialCash: number) => void;
  closeShift: (actualCash: number) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);
const generateInvoice = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return "INV-" + date + "-" + seq;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: initialUser,
      isLoggedIn: false,
      login: (username, password) => {
        if (username && password) {
          set({ user: { ...initialUser, username, name: username === "admin" ? "Admin" : username }, isLoggedIn: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isLoggedIn: false }),

      storeSettings: initialSettings,
      updateStoreSettings: (settings) =>
        set((state) => ({ storeSettings: { ...state.storeSettings, ...settings } })),
      resetStoreSettings: () => set({ storeSettings: { ...initialSettings } }),

      products: initialProducts,
      addProduct: (product) =>
        set((state) => ({ products: [...state.products, { ...product, id: generateId() }] })),
      updateProduct: (id, data) =>
        set((state) => ({ products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
      deleteProduct: (id) =>
        set((state) => ({ products: state.products.filter((p) => p.id !== id) })),

      cart: [],
      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((c) => c.product.id === product.id);
          if (existing) {
            return { cart: state.cart.map((c) => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c) };
          }
          return { cart: [...state.cart, { product, qty: 1, discount: 0 }] };
        }),
      updateCartQty: (productId, qty) =>
        set((state) => ({
          cart: qty <= 0
            ? state.cart.filter((c) => c.product.id !== productId)
            : state.cart.map((c) => c.product.id === productId ? { ...c, qty } : c),
        })),
      removeFromCart: (productId) =>
        set((state) => ({ cart: state.cart.filter((c) => c.product.id !== productId) })),
      clearCart: () => set({ cart: [] }),

      transactions: [],
      createTransaction: (paymentMethod, amountPaid) => {
        const state = get();
        if (state.cart.length === 0) return null;
        const subtotal = state.cart.reduce((sum, item) => sum + item.product.sell_price * item.qty - item.discount, 0);
        const total = subtotal;
        if (amountPaid < total && paymentMethod === "tunai") return null;

        const invoice = generateInvoice();
        const transaction: Transaction = {
          id: generateId(),
          invoice,
          date: new Date().toISOString(),
          cashier: state.user?.name || "Kasir",
          items: [...state.cart],
          subtotal,
          discount: 0,
          total,
          payment_method: paymentMethod,
          amount_paid: amountPaid,
          change: Math.max(0, amountPaid - total),
          status: "selesai",
        };

        const updatedProducts = state.products.map((p) => {
          const cartItem = state.cart.find((c) => c.product.id === p.id);
          if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
          return p;
        });

        const newCash = paymentMethod === "tunai" ? state.cashBalance + total : state.cashBalance;
        const cashTx = paymentMethod === "tunai"
          ? [...state.cashTransactions, { id: generateId(), date: new Date().toISOString(), keterangan: "Penjualan " + invoice, jenis: "masuk" as const, jumlah: total }]
          : state.cashTransactions;

        set({
          transactions: [transaction, ...state.transactions],
          products: updatedProducts,
          cart: [],
          cashBalance: newCash,
          cashTransactions: cashTx,
        });
        return transaction;
      },

      customers: [
        { id: "1", name: "Bu Sari", phone: "081234567124", totalBelanja: 2450000, totalHutang: 120000, sisaHutang: 120000 },
        { id: "2", name: "Pak Ahmad", phone: "081234567878", totalBelanja: 1870000, totalHutang: 0, sisaHutang: 0 },
        { id: "3", name: "Bu Rini", phone: "082234567012", totalBelanja: 3200000, totalHutang: 75000, sisaHutang: 75000 },
        { id: "4", name: "Toko Kita", phone: "081234567456", totalBelanja: 980000, totalHutang: 200000, sisaHutang: 200000 },
      ],
      addCustomer: (name, phone) =>
        set((state) => ({ customers: [...state.customers, { id: generateId(), name, phone, totalBelanja: 0, totalHutang: 0, sisaHutang: 0 }] })),
      updateCustomer: (id, data) =>
        set((state) => ({ customers: state.customers.map((c) => (c.id === id ? { ...c, ...data } : c)) })),
      deleteCustomer: (id) =>
        set((state) => ({ customers: state.customers.filter((c) => c.id !== id) })),

      suppliers: [
        { id: "1", name: "Toko Sumber Rejeki", phone: "081111111111", totalPembelian: 1250000, hutang: 0 },
        { id: "2", name: "UD. Berkah Jaya", phone: "082222222222", totalPembelian: 980000, hutang: 0 },
        { id: "3", name: "CV. Maju Makmur", phone: "083333333333", totalPembelian: 1560000, hutang: 560000 },
      ],
      addSupplier: (name, phone) =>
        set((state) => ({ suppliers: [...state.suppliers, { id: generateId(), name, phone, totalPembelian: 0, hutang: 0 }] })),
      updateSupplier: (id, data) =>
        set((state) => ({ suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...data } : s)) })),
      deleteSupplier: (id) =>
        set((state) => ({ suppliers: state.suppliers.filter((s) => s.id !== id) })),

      purchases: [
        { id: "1", date: "2026-10-01", supplier: "Toko Sumber Rejeki", total: 1250000, status: "Lunas" },
        { id: "2", date: "2026-09-30", supplier: "UD. Berkah Jaya", total: 980000, status: "Lunas" },
        { id: "3", date: "2026-09-28", supplier: "CV. Maju Makmur", total: 1560000, status: "Hutang" },
        { id: "4", date: "2026-09-25", supplier: "Toko Sumber Rejeki", total: 875000, status: "Lunas" },
        { id: "5", date: "2026-09-22", supplier: "UD. Berkah Jaya", total: 1320000, status: "Lunas" },
      ],
      addPurchase: (supplier, total, status, items) => {
        const state = get();
        const updatedProducts = state.products.map((p) => {
          const item = items.find((i) => i.productId === p.id);
          if (item) return { ...p, stock: p.stock + item.qty };
          return p;
        });
        set({
          purchases: [{ id: generateId(), date: new Date().toISOString().slice(0, 10), supplier, total, status }, ...state.purchases],
          products: updatedProducts,
        });
      },

      cashBalance: 2480000,
      cashTransactions: [
        { id: "1", date: "2026-10-01", keterangan: "Penjualan Tunai", jenis: "masuk", jumlah: 530000 },
        { id: "2", date: "2026-10-01", keterangan: "Pembelian Barang", jenis: "keluar", jumlah: 1250000 },
        { id: "3", date: "2026-10-01", keterangan: "Biaya Operasional", jenis: "keluar", jumlah: 55000 },
        { id: "4", date: "2026-09-30", keterangan: "Hutang Pelanggan", jenis: "masuk", jumlah: 120000 },
      ],
      addCashTransaction: (keterangan, jenis, jumlah) =>
        set((state) => ({
          cashTransactions: [{ id: generateId(), date: new Date().toISOString().slice(0, 10), keterangan, jenis, jumlah }, ...state.cashTransactions],
          cashBalance: jenis === "masuk" ? state.cashBalance + jumlah : state.cashBalance - jumlah,
        })),

      currentShift: { openedAt: "2026-10-01T07:00:00", initialCash: 500000, status: "open" },
      openShift: (initialCash) => set({ currentShift: { openedAt: new Date().toISOString(), initialCash, status: "open" }, cashBalance: initialCash }),
      closeShift: () => set((state) => ({ currentShift: state.currentShift ? { ...state.currentShift, status: "closed" } : null })),
    }),
    { name: "warung-sembako-storage-v2" }
  )
);
