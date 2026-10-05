"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";
import { Plus, X } from "lucide-react";

export default function SupplierPage() {
  const { suppliers, addSupplier } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleAdd = () => {
    if (!name) return alert("Nama wajib diisi");
    addSupplier(name, phone);
    setShowForm(false);
    setName("");
    setPhone("");
  };

  return (
    <>
      <Header title="Supplier" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Data Supplier</h2>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
            <Plus className="h-4 w-4" /> Tambah Supplier
          </button>
        </div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Nama</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">No HP</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Total Pembelian</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Hutang</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3">{s.phone}</td>
                    <td className="px-4 py-3">{formatRupiah(s.totalPembelian)}</td>
                    <td className="px-4 py-3">
                      <span className={s.hutang > 0 ? "text-red-600 font-medium" : "text-slate-600"}>
                        {formatRupiah(s.hutang)}
                      </span>
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
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Tambah Supplier</h3>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Supplier</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Nama supplier" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">No HP</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="08xxxxxxxxxx" />
                </div>
                <button onClick={handleAdd} className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700">Simpan</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
