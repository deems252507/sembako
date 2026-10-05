"use client";

import Header from "@/components/Header";
import { products } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/utils";
import { Package, Plus, Search } from "lucide-react";

function getStockBadge(stock: number, min: number) {
  if (stock <= 0) return { label: "Habis", className: "badge-danger" };
  if (stock <= min) return { label: "Menipis", className: "badge-warning" };
  return { label: "Aman", className: "badge-success" };
}

export default function ProdukPage() {
  return (
    <>
      <Header title="Produk & Stok" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Produk & Stok</h2>
            <p className="text-sm text-slate-500">{products.length} produk terdaftar</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
            <Plus className="h-4 w-4" />
            Tambah Produk
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-400"
            />
          </div>
          <select className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
            <option>Semua Kategori</option>
            <option>Sembako</option>
            <option>Minuman</option>
            <option>Makanan</option>
          </select>
          <select className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
            <option>Semua Status</option>
            <option>Aman</option>
            <option>Menipis</option>
            <option>Habis</option>
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">No</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Gambar</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Nama Produk</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Kategori</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Stok</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Harga Jual</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const badge = getStockBadge(p.stock, p.min_stock);
                  return (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                          <Package className="h-5 w-5 text-slate-400" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.category}</td>
                      <td className="px-4 py-3 font-medium">{p.stock}</td>
                      <td className="px-4 py-3 font-medium">{formatRupiah(p.sell_price)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${badge.className}`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
