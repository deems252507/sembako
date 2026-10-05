"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";
import { Package, Plus, Search, X } from "lucide-react";

export default function ProdukPage() {
  const { products, addProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", sku: "", category: "Sembako", unit: "pcs",
    buy_price: 0, sell_price: 0, stock: 0, min_stock: 5, status: "aktif" as const,
  });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name || !form.sku) return alert("Nama dan SKU wajib");
    addProduct(form);
    setShowForm(false);
    setForm({ name: "", sku: "", category: "Sembako", unit: "pcs", buy_price: 0, sell_price: 0, stock: 0, min_stock: 5, status: "aktif" });
  };

  return (
    <>
      <Header title="Produk & Stok" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Produk & Stok</h2>
            <p className="text-sm text-slate-500">{products.length} produk terdaftar</p>
          </div>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
            <Plus className="h-4 w-4" /> Tambah Produk
          </button>
        </div>

        <div className="card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-400" />
          </div>
        </div>

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
                {filtered.map((p, i) => (
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
                      <span className={`badge ${p.stock <= 0 ? "badge-danger" : p.stock <= p.min_stock ? "badge-warning" : "badge-success"}`}>
                        {p.stock <= 0 ? "Habis" : p.stock <= p.min_stock ? "Menipis" : "Aman"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { if (confirm("Hapus produk?")) deleteProduct(p.id); }}
                        className="text-red-500 hover:text-red-700 text-sm font-medium">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Tambah Produk</h3>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Produk *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">SKU *</label>
                    <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                      <option>Sembako</option><option>Minuman</option><option>Makanan</option><option>Perawatan</option><option>Lainnya</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Harga Beli</label>
                    <input type="number" value={form.buy_price || ""} onChange={(e) => setForm({ ...form, buy_price: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Harga Jual</label>
                    <input type="number" value={form.sell_price || ""} onChange={(e) => setForm({ ...form, sell_price: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Stok Awal</label>
                    <input type="number" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Stok</label>
                    <input type="number" value={form.min_stock || ""} onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                  </div>
                </div>
                <button onClick={handleAdd} className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700">
                  Simpan Produk
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
