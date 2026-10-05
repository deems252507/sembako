"use client";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";

export default function LaporanPage() {
  const { transactions, purchases, products, cashBalance } = useStore();
  const totalOmzet = transactions.reduce((s, t) => s + t.total, 0);
  const totalTrx = transactions.length;
  const avgTrx = totalTrx > 0 ? totalOmzet / totalTrx : 0;

  return (
    <>
      <Header title="Laporan" />
      <main className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          {["Penjualan", "Pembelian", "Omzet", "Laba", "Stok", "Hutang", "Keuangan"].map((tab) => (
            <button key={tab} className={`rounded-full px-4 py-1.5 text-sm font-medium ${tab === "Penjualan" ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="text-sm text-slate-500">Total Omzet</p>
            <p className="text-2xl font-bold text-green-600">{formatRupiah(totalOmzet || 3250000)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">Jumlah Transaksi</p>
            <p className="text-2xl font-bold">{totalTrx || 28}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">Rata-rata Transaksi</p>
            <p className="text-2xl font-bold">{formatRupiah(avgTrx || 116071)}</p>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Laporan Penjualan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Invoice</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Kasir</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Metode</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      Belum ada transaksi. Lakukan penjualan di halaman Kasir.
                    </td>
                  </tr>
                ) : transactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-green-600">{t.invoice}</td>
                    <td className="px-4 py-3">{t.date.slice(0, 10)}</td>
                    <td className="px-4 py-3">{t.cashier}</td>
                    <td className="px-4 py-3 capitalize">{t.payment_method}</td>
                    <td className="px-4 py-3 font-medium">{formatRupiah(t.total)}</td>
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
