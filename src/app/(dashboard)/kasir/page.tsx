"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { products, categories } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/utils";
import { CartItem, Product } from "@/types";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  X,
  ShoppingCart,
} from "lucide-react";

export default function KasirPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartMobile, setShowCartMobile] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search));
      const matchCategory =
        activeCategory === "Semua" || p.category === activeCategory;
      return matchSearch && matchCategory && p.status === "aktif";
    });
  }, [search, activeCategory]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prev, { product, qty: 1, discount: 0 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, qty: Math.max(0, item.qty + delta) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.sell_price * item.qty - item.discount,
    0
  );
  const total = subtotal;

  const CartPanel = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Keranjang
          {cart.length > 0 && (
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.qty, 0)}
            </span>
          )}
        </h3>
        <button
          onClick={() => setShowCartMobile(false)}
          className="lg:hidden p-1 hover:bg-slate-100 rounded"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <ShoppingCart className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">Keranjang masih kosong</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border border-slate-200">
                <Package className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatRupiah(item.product.sell_price)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateQty(item.product.id, -1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-100"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">
                  {item.qty}
                </span>
                <button
                  onClick={() => updateQty(item.product.id, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="text-right min-w-[70px]">
                <p className="text-sm font-semibold text-slate-800">
                  {formatRupiah(item.product.sell_price * item.qty)}
                </p>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-red-400 hover:text-red-600 mt-0.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-200 p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-medium">{formatRupiah(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Diskon</span>
          <span className="font-medium">Rp 0</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t border-slate-100 pt-3">
          <span>Total</span>
          <span className="text-green-600">{formatRupiah(total)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button className="rounded-xl border-2 border-green-500 bg-green-50 py-2.5 text-sm font-semibold text-green-700">
            Tunai
          </button>
          <button className="rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:border-green-300">
            QRIS
          </button>
          <button className="rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:border-green-300">
            Transfer
          </button>
        </div>

        <button
          disabled={cart.length === 0}
          className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Bayar Sekarang
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Header title="Kasir" />
      <main className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 space-y-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk, nama, barcode, SKU..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-green-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="card p-3 text-left hover:border-green-300 hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="flex h-20 items-center justify-center rounded-lg bg-slate-50 mb-2">
                    <Package className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-tight">
                    {product.name}
                  </p>
                  <p className="text-sm font-bold text-green-600 mt-1">
                    {formatRupiah(product.sell_price)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Stok: {product.stock}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex w-[380px] border-l border-slate-200 bg-white flex-col">
          <CartPanel />
        </div>

        <button
          onClick={() => setShowCartMobile(true)}
          className="lg:hidden fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg z-40"
        >
          <ShoppingCart className="h-6 w-6" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
              {cart.reduce((s, i) => s + i.qty, 0)}
            </span>
          )}
        </button>

        {showCartMobile && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowCartMobile(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-2xl overflow-hidden">
              <CartPanel />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
