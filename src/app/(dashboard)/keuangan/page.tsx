"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";
import { Plus, X, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function KeuanganPage() {
  const { cashBalance, cashTransactions, addCashTransaction } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [jenis, setJenis] = useState<"masuk" | "keluar">("masuk");
  const [keterangan, setKeterangan] = useState("");
  const [jumlah, setJumlah] = useState("");

  const totalMasuk = cashTransactions.filter(t => t.jenis === "masuk").reduce((s, t) => s + t.jumlah, 0);
  const totalKeluar = cashTransactions.filter(t => t.jenis === "keluar").reduce((s, t) => s + t.jumlah, 0);

  const handleAdd = () => {
    if (!keterangan || !jumlah) return alert("Lengkapi data");
    addCashTransaction(keterangan, jenis, Number(jumlah));
    setShowForm(false);
    setKeterangan("");
    setJumlah("");
  };

  return (
    <>
      <Header title="Keuangan" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="text-sm text-slate-500">Saldo Kas</p>
            <p className="text-2xl font-bold text-green-600">{formatRupiah(cashBalance)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">Total Kas Masuk</p>
            <p className="text-2xl font-bold text-blue-600">{formatRupiah(totalMasuk)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">Total Kas Keluar</p>
            <p className="text-2xl font-bold text-red-600">{formatRupiah(totalKeluar)}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Riwayat Kas</h2>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
            <Plus className="h-4 w-4" /> Tambah Transaksi
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Keterangan</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Jenis</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {cashTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">{t.date.slice(0, 10)}</td>
                    <td className="px-4 py-3 font-medium">{t.keterangan}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 badge ${t.jenis === "masuk" ? "badge-success" : "badge-danger"}`}>
                        {t.jenis === "masuk" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {t.jenis === "masuk" ? "Masuk" : "Keluar"}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-medium ${t.jenis === "masuk" ? "text-green-600" : "text-red-600"}`}>
                      {t.jenis === "masuk" ? "+" : "-"}{formatRupiah(t.jumlah)}
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
                <h3 className="text-lg font-bold">Tambah Transaksi Kas</h3>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setJenis("masuk")} className={`rounded-xl py-2.5 text-sm font-semibold ${jenis === "masuk" ? "bg-green-600 text-white" : "border border-slate-200"}`}>Kas Masuk</button>
                  <button onClick={() => setJenis("keluar")} className={`rounded-xl py-2.5 text-sm font-semibold ${jenis === "keluar" ? "bg-red-600 text-white" : "border border-slate-200"}`}>Kas Keluar</button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Keterangan</label>
                  <input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Contoh: Bayar listrik" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jumlah</label>
                  <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="0" />
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
