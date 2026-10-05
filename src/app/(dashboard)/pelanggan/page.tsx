"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";
import { Plus, X, Pencil, Trash2 } from "lucide-react";

export default function PelangganPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const totalPiutang = customers.reduce((s, c) => s + c.sisaHutang, 0);

  const openAdd = () => { setEditId(null); setName(""); setPhone(""); setShowForm(true); };
  const openEdit = (c: typeof customers[0]) => { setEditId(c.id); setName(c.name); setPhone(c.phone); setShowForm(true); };

  const handleSave = () => {
    if (!name) return alert("Nama wajib diisi");
    if (editId) updateCustomer(editId, { name, phone });
    else addCustomer(name, phone);
    setShowForm(false);
  };

  return (
    <>
      <Header title="Pelanggan" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5"><p className="text-sm text-slate-500">Total Pelanggan</p><p className="text-2xl font-bold">{customers.length}</p></div>
          <div className="card p-5"><p className="text-sm text-slate-500">Total Piutang</p><p className="text-2xl font-bold text-amber-600">{formatRupiah(totalPiutang)}</p></div>
          <div className="card p-5"><p className="text-sm text-slate-500">Sudah Lunas</p><p className="text-2xl font-bold text-green-600">{customers.filter(c => c.sisaHutang === 0).length}</p></div>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Data Pelanggan</h2>
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
            <Plus className="h-4 w-4" /> Tambah Pelanggan
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Nama</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">No HP</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Total Belanja</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Sisa Hutang</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">{c.phone}</td>
                    <td className="px-4 py-3">{formatRupiah(c.totalBelanja)}</td>
                    <td className={"px-4 py-3 " + (c.sisaHutang > 0 ? "text-red-600 font-medium" : "")}>{formatRupiah(c.sisaHutang)}</td>
                    <td className="px-4 py-3">
                      <span className={"badge " + (c.sisaHutang > 0 ? "badge-warning" : "badge-success")}>{c.sisaHutang > 0 ? "Ada Hutang" : "Lunas"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => { if (confirm("Hapus " + c.name + "?")) deleteCustomer(c.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-4 w-4" /></button>
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
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">{editId ? "Edit Pelanggan" : "Tambah Pelanggan"}</h3>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">No HP</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <button onClick={handleSave} className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700">
                  {editId ? "Simpan Perubahan" : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
