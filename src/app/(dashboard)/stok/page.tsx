"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";
import { Package, AlertTriangle, X } from "lucide-react";

export default function StokPage() {
  const { products, adjustStock, stockLogs } = useStore();
  const [adjustModal, setAdjustModal] = useState<{ id: string; name: string; stock: number } | null>(null);
  const [newStock, setNewStock] = useState("");
  const [note, setNote] = useState("");

  const lowStock = products.filter((p) => p.stock <= p.min_stock);
  const outOfStock = products.filter((p) => p.stock <= 0);

  const handleAdjust = () => {
    if (!adjustModal) return;
    const qty = Number(newStock);
    if (isNaN(qty) || qty < 0) return alert("Stok tidak valid");
    adjustStock(adjustModal.id, qty, note || "Penyesuaian stok");
    setAdjustModal(null);
    setNewStock("");
    setNote("");
    alert("Stok berhasil disesuaikan");
  };

  return (
    <>
      <Header title="Stok" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="text-sm text-slate-500">Total Produk</p>
            <p className="text-2xl font-bold">{products.length}</p>
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
                  <div className="flex items-center gap-3">
                    <span className={"text-sm font-bold " + (p.stock <= 0 ? "text-red-600" : "text-amber-600")}>
                      Stok: {p.stock}
                    </span>
                    <button
                      onClick={() => { setAdjustModal({ id: p.id, name: p.name, stock: p.stock }); setNewStock(String(p.stock)); }}
                      className="text-xs text-green-600 font-medium hover:underline"
                    >
                      Sesuaikan
                    </button>
                  </div>
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
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Min</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Harga Jual</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3 font-semibold">{p.stock}</td>
                    <td className="px-4 py-3">{p.min_stock}</td>
                    <td className="px-4 py-3">{formatRupiah(p.sell_price)}</td>
                    <td className="px-4 py-3">
                      <span className={"badge " + (p.stock <= 0 ? "badge-danger" : p.stock <= p.min_stock ? "badge-warning" : "badge-success")}>
                        {p.stock <= 0 ? "Habis" : p.stock <= p.min_stock ? "Menipis" : "Aman"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setAdjustModal({ id: p.id, name: p.name, stock: p.stock }); setNewStock(String(p.stock)); }}
                        className="text-green-600 text-sm font-medium hover:underline"
                      >
                        Sesuaikan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {stockLogs.length > 0 && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b"><h3 className="font-semibold">Riwayat Penyesuaian Stok</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Tanggal</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Produk</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Sebelum</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Sesudah</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {stockLogs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="border-b border-slate-50">
                      <td className="px-4 py-3">{log.date.slice(0, 10)}</td>
                      <td className="px-4 py-3 font-medium">{log.productName}</td>
                      <td className="px-4 py-3">{log.qtyBefore}</td>
                      <td className="px-4 py-3 font-medium">{log.qtyAfter}</td>
                      <td className="px-4 py-3 text-slate-500">{log.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adjustModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setAdjustModal(null)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Penyesuaian Stok</h3>
                <button onClick={() => setAdjustModal(null)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-3 text-sm">
                  <p className="font-semibold">{adjustModal.name}</p>
                  <p className="text-slate-500">Stok saat ini: {adjustModal.stock}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stok Baru</label>
                  <input type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Keterangan</label>
                  <input value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="Contoh: Stock opname, barang rusak, dll"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <button onClick={handleAdjust}
                  className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700">
                  Simpan Penyesuaian
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
