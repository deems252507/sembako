"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";
import { Package, Plus, Search, X, Pencil, Trash2, Eye, ImagePlus } from "lucide-react";
import { Product } from "@/types";

export default function ProdukPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const emptyForm = { name: "", sku: "", category: "Sembako", unit: "pcs", buy_price: 0, sell_price: 0, stock: 0, min_stock: 5, status: "aktif" as const, image: "" };
  const [form, setForm] = useState(emptyForm);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ name: p.name, sku: p.sku, category: p.category, unit: p.unit, buy_price: p.buy_price, sell_price: p.sell_price, stock: p.stock, min_stock: p.min_stock, status: p.status as "aktif", image: p.image || "" });
    setShowForm(true);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) {
      alert("Gambar terlalu besar. Maksimal 500KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.name || !form.sku) return alert("Nama dan SKU wajib diisi");
    if (editId) updateProduct(editId, form);
    else addProduct(form);
    setShowForm(false);
    setEditId(null);
  };

  return (
    <>
      <Header title="Produk & Stok" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Produk & Stok</h2>
            <p className="text-sm text-slate-500">{products.length} produk terdaftar</p>
          </div>
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
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
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Produk</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Kategori</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Stok</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Harga Jual</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 overflow-hidden">
                          {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-slate-400" />}
                        </div>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3 font-medium">{p.stock}</td>
                    <td className="px-4 py-3 font-medium">{formatRupiah(p.sell_price)}</td>
                    <td className="px-4 py-3">
                      <span className={"badge " + (p.stock <= 0 ? "badge-danger" : p.stock <= p.min_stock ? "badge-warning" : "badge-success")}>
                        {p.stock <= 0 ? "Habis" : p.stock <= p.min_stock ? "Menipis" : "Aman"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDetail(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Detail"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => { if (confirm("Hapus produk \"" + p.name + "\"?")) deleteProduct(p.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                      </div>
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
                <h3 className="text-lg font-bold">{editId ? "Edit Produk" : "Tambah Produk"}</h3>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                {/* Image upload */}
                <div>
                  <label className="block text-sm font-medium mb-1">Gambar Produk</label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 border border-dashed border-slate-300 overflow-hidden">
                      {form.image ? (
                        <img src={form.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlus className="h-8 w-8 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium cursor-pointer hover:bg-slate-50">
                        <ImagePlus className="h-4 w-4" />
                        Pilih Gambar
                        <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                      </label>
                      <p className="text-xs text-slate-400 mt-1">Max 500KB (JPG/PNG)</p>
                      {form.image && (
                        <button onClick={() => setForm({ ...form, image: "" })} className="text-xs text-red-500 mt-1">Hapus gambar</button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nama Produk *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">SKU *</label>
                    <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                      <option>Sembako</option><option>Minuman</option><option>Makanan</option><option>Perawatan</option><option>Lainnya</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Harga Beli</label>
                    <input type="number" value={form.buy_price || ""} onChange={(e) => setForm({ ...form, buy_price: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Harga Jual</label>
                    <input type="number" value={form.sell_price || ""} onChange={(e) => setForm({ ...form, sell_price: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Stok</label>
                    <input type="number" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Stok</label>
                    <input type="number" value={form.min_stock || ""} onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                  </div>
                </div>
                <button onClick={handleSave} className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700">
                  {editId ? "Simpan Perubahan" : "Simpan Produk"}
                </button>
              </div>
            </div>
          </div>
        )}

        {detail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Detail Produk</h3>
                <button onClick={() => setDetail(null)}><X className="h-5 w-5" /></button>
              </div>
              {detail.image && (
                <div className="mb-4 flex justify-center">
                  <img src={detail.image} alt={detail.name} className="h-32 w-32 object-cover rounded-xl" />
                </div>
              )}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Nama</span><span className="font-medium">{detail.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">SKU</span><span>{detail.sku}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Kategori</span><span>{detail.category}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Harga Beli</span><span>{formatRupiah(detail.buy_price)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Harga Jual</span><span className="font-medium text-green-600">{formatRupiah(detail.sell_price)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Stok</span><span className="font-medium">{detail.stock}</span></div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => { setDetail(null); openEdit(detail); }} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium">Edit</button>
                <button onClick={() => setDetail(null)} className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white">Tutup</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
