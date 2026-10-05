"use client";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";

export default function HutangPage() {
  const { customers, suppliers } = useStore();
  const piutang = customers.filter((c) => c.sisaHutang > 0);
  const hutangSupplier = suppliers.filter((s) => s.hutang > 0);
  const totalPiutang = piutang.reduce((s, c) => s + c.sisaHutang, 0);
  const totalHutang = hutangSupplier.reduce((s, c) => s + c.hutang, 0);

  return (
    <>
      <Header title="Hutang & Piutang" />
      <main className="p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="text-sm text-slate-500">Total Piutang Pelanggan</p>
            <p className="text-2xl font-bold text-amber-600">{formatRupiah(totalPiutang)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">Total Hutang Supplier</p>
            <p className="text-2xl font-bold text-red-600">{formatRupiah(totalHutang)}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Piutang Pelanggan</h3>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Nama</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Total Hutang</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Sisa</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {piutang.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Tidak ada piutang</td></tr>
                ) : piutang.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">{formatRupiah(c.totalHutang)}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{formatRupiah(c.sisaHutang)}</td>
                    <td className="px-4 py-3">
                      <button className="text-green-600 text-sm font-medium hover:underline">Bayar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Hutang Supplier</h3>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Supplier</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Hutang</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {hutangSupplier.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">Tidak ada hutang</td></tr>
                ) : hutangSupplier.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{formatRupiah(s.hutang)}</td>
                    <td className="px-4 py-3">
                      <button className="text-green-600 text-sm font-medium hover:underline">Bayar</button>
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
