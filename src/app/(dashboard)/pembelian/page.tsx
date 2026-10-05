"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";
import { Plus, X } from "lucide-react";

export default function PembelianPage() {
  const { purchases, suppliers, products, addPurchase } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [status, setStatus] = useState("Lunas");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState(1);
  const [items, setItems] = useState<{ productId: string; name: string; qty: number; price: number }[]>([]);

  const addItem = () => {
    const p = products.find((x) => x.id === selectedProduct);
    if (!p) return;
    setItems([...items, { productId: p.id, name: p.name, qty, price: p.buy_price }]);
    setSelectedProduct("");
    setQty(1);
  };

  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  const handleSubmit = () => {
    if (!supplier || items.length === 0) return alert("Lengkapi data!");
    addPurchase(supplier, total, status, items.map((i) => ({ productId: i.productId, qty: i.qty, price: i.price })));
    setShowForm(false);
    setItems([]);
    setSupplier("");
    alert("Pembelian berhasil! Stok otomatis bertambah.");
  };

  return (
    <>
      <Header title="Pembelian" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Daftar Pembelian</h2>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
            <Plus className="h-4 w-4" /> Pembelian Baru
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Supplier</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">{p.date}</td>
                    <td className="px-4 py-3 font-medium">{p.supplier}</td>
                    <td className="px-4 py-3">{formatRupiah(p.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.status === "Lunas" ? "badge-success" : "badge-danger"}`}>{p.status}</span>
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
                <h3 className="text-lg font-bold">Pembelian Baru</h3>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Supplier</label>
                  <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                    <option value="">Pilih Supplier</option>
                    {suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                    <option value="Lunas">Lunas</option>
                    <option value="Hutang">Hutang</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                    <option value="">Pilih Produk</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} min={1} className="w-20 rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                  <button onClick={addItem} className="rounded-xl bg-green-600 px-4 text-white text-sm font-medium">Tambah</button>
                </div>
                {items.length > 0 && (
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm bg-slate-50 rounded-lg p-2">
                        <span>{item.name} x{item.qty}</span>
                        <span>{formatRupiah(item.qty * item.price)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-green-600">{formatRupiah(total)}</span>
                    </div>
                  </div>
                )}
                <button onClick={handleSubmit} className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700">
                  Simpan Pembelian
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
