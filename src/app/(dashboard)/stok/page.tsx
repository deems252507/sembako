"use client";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";
import { Package, AlertTriangle } from "lucide-react";

export default function StokPage() {
  const { products } = useStore();
  const lowStock = products.filter((p) => p.stock <= p.min_stock);
  const outOfStock = products.filter((p) => p.stock <= 0);

  return (
    <>
      <Header title="Stok" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="text-sm text-slate-500">Total Produk</p>
            <p className="text-2xl font-bold text-slate-800">{products.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">Stok Menipis</p>
            <p className="text-2xl font-bold text-amber-600">{lowStock.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">Stok Habis</p>
            <p className="text-2xl font-bold text-red-600">{outOfStock.length}</p>
          </div>
        </div>

        {lowStock.length > 0 && (
          <div className="card p-4 border-amber-200 bg-amber-50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">Stok Menipis / Habis</h3>
            </div>
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-slate-500">Min: {p.min_stock}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${p.stock <= 0 ? "text-red-600" : "text-amber-600"}`}>
                    Stok: {p.stock}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Produk</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Kategori</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Stok</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Min Stok</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Harga Jual</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-slate-600">{p.category}</td>
                    <td className="px-4 py-3 font-semibold">{p.stock}</td>
                    <td className="px-4 py-3">{p.min_stock}</td>
                    <td className="px-4 py-3">{formatRupiah(p.sell_price)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.stock <= 0 ? "badge-danger" : p.stock <= p.min_stock ? "badge-warning" : "badge-success"}`}>
                        {p.stock <= 0 ? "Habis" : p.stock <= p.min_stock ? "Menipis" : "Aman"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
