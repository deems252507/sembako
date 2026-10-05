"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";
import { Plus, X, ArrowDownLeft, ArrowUpRight, Printer, Trash2 } from "lucide-react";

export default function KeuanganPage() {
  const { cashBalance, cashTransactions, addCashTransaction, deleteCashTransaction, storeSettings, transactions } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [jenis, setJenis] = useState<"masuk" | "keluar">("masuk");
  const [keterangan, setKeterangan] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [metode, setMetode] = useState("tunai");

  const totalMasuk = cashTransactions.filter(t => t.jenis === "masuk").reduce((s, t) => s + t.jumlah, 0);
  const totalKeluar = cashTransactions.filter(t => t.jenis === "keluar").reduce((s, t) => s + t.jumlah, 0);

  const cashSales = transactions.filter(t => t.payment_method === "tunai" && !(t as any).isHutang).reduce((s, t) => s + t.total, 0);
  const qrisSales = transactions.filter(t => t.payment_method === "qris").reduce((s, t) => s + t.total, 0);
  const tfSales = transactions.filter(t => t.payment_method === "transfer").reduce((s, t) => s + t.total, 0);

  const handleAdd = () => {
    if (!keterangan || !jumlah) return alert("Lengkapi data");
    const ket = keterangan + (metode !== "tunai" ? " (" + metode.toUpperCase() + ")" : "");
    addCashTransaction(ket, jenis, Number(jumlah));
    setShowForm(false);
    setKeterangan("");
    setJumlah("");
  };

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = cashTransactions.map(t =>
      `<tr>
        <td>${t.date.slice(0,10)}</td>
        <td>${t.keterangan}</td>
        <td>${t.jenis === "masuk" ? "Masuk" : "Keluar"}</td>
        <td style="text-align:right;color:${t.jenis==="masuk"?"green":"red"}">${t.jenis==="masuk"?"+":"-"}${formatRupiah(t.jumlah)}</td>
      </tr>`
    ).join("");
    win.document.write(`
      <html><head><title>Laporan Keuangan - ${storeSettings.store_name}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;font-size:13px}
        h1{margin:0;font-size:18px} .sub{color:#555;margin:4px 0 16px;font-size:13px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#f5f5f5}
        .cards{display:flex;gap:16px;margin:16px 0}
        .card{border:1px solid #ddd;border-radius:8px;padding:12px;flex:1}
        .card b{display:block;font-size:16px;margin-top:4px}
      </style></head><body>
      <h1>${storeSettings.store_name}</h1>
      <p class="sub">Laporan Keuangan — ${new Date().toLocaleDateString("id-ID")}<br/>${storeSettings.address} | ${storeSettings.phone}</p>
      <div class="cards">
        <div class="card">Saldo Kas<b style="color:green">${formatRupiah(cashBalance)}</b></div>
        <div class="card">Kas Masuk<b style="color:#2563eb">${formatRupiah(totalMasuk)}</b></div>
        <div class="card">Kas Keluar<b style="color:red">${formatRupiah(totalKeluar)}</b></div>
      </div>
      <div class="cards">
        <div class="card">Penjualan Tunai<b>${formatRupiah(cashSales)}</b></div>
        <div class="card">QRIS<b>${formatRupiah(qrisSales)}</b></div>
        <div class="card">Transfer<b>${formatRupiah(tfSales)}</b></div>
      </div>
      <table>
        <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Jenis</th><th>Jumlah</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <script>window.onload=function(){window.print()}</script>
      </body></html>
    `);
    win.document.close();
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4">
            <p className="text-xs text-slate-500">Penjualan Tunai</p>
            <p className="text-lg font-bold">{formatRupiah(cashSales)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-500">QRIS</p>
            <p className="text-lg font-bold">{formatRupiah(qrisSales)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-slate-500">Transfer</p>
            <p className="text-lg font-bold">{formatRupiah(tfSales)}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Riwayat Kas</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
              <Printer className="h-4 w-4" /> Cetak PDF
            </button>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
              <Plus className="h-4 w-4" /> Tambah
            </button>
          </div>
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
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {cashTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">{t.date.slice(0, 10)}</td>
                    <td className="px-4 py-3 font-medium">{t.keterangan}</td>
                    <td className="px-4 py-3">
                      <span className={"inline-flex items-center gap-1 badge " + (t.jenis === "masuk" ? "badge-success" : "badge-danger")}>
                        {t.jenis === "masuk" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {t.jenis === "masuk" ? "Masuk" : "Keluar"}
                      </span>
                    </td>
                    <td className={"px-4 py-3 font-medium " + (t.jenis === "masuk" ? "text-green-600" : "text-red-600")}>
                      {t.jenis === "masuk" ? "+" : "-"}{formatRupiah(t.jumlah)}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { if (confirm("Hapus transaksi kas ini?")) deleteCashTransaction(t.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Hapus">
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                  <button onClick={() => setJenis("masuk")} className={"rounded-xl py-2.5 text-sm font-semibold " + (jenis === "masuk" ? "bg-green-600 text-white" : "border border-slate-200")}>Kas Masuk</button>
                  <button onClick={() => setJenis("keluar")} className={"rounded-xl py-2.5 text-sm font-semibold " + (jenis === "keluar" ? "bg-red-600 text-white" : "border border-slate-200")}>Kas Keluar</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["tunai", "qris", "transfer"].map((m) => (
                    <button key={m} onClick={() => setMetode(m)}
                      className={"rounded-xl py-2 text-xs font-semibold capitalize " + (metode === m ? "border-2 border-green-500 bg-green-50 text-green-700" : "border border-slate-200")}>
                      {m}
                    </button>
                  ))}
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
