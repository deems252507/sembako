"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";

export default function ShiftPage() {
  const { currentShift, openShift, closeShift, cashBalance, transactions } = useStore();
  const [initialCash, setInitialCash] = useState("500000");
  const [actualCash, setActualCash] = useState("");

  const cashSales = transactions.filter(t => t.payment_method === "tunai").reduce((s, t) => s + t.total, 0);

  return (
    <>
      <Header title="Shift Kasir" />
      <main className="p-4 lg:p-6 space-y-4">
        {currentShift?.status === "open" ? (
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-lg font-semibold text-green-700">Shift Sedang Aktif</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Dibuka</p>
                <p className="font-medium">{new Date(currentShift.openedAt).toLocaleString("id-ID")}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Modal Awal</p>
                <p className="font-medium">{formatRupiah(currentShift.initialCash)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Penjualan Tunai</p>
                <p className="font-medium text-green-600">{formatRupiah(cashSales)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Kas Saat Ini</p>
                <p className="font-medium">{formatRupiah(cashBalance)}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Uang Fisik (saat tutup shift)</label>
              <input type="number" value={actualCash} onChange={(e) => setActualCash(e.target.value)}
                className="w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Hitung uang di laci" />
            </div>
            <button onClick={() => { closeShift(Number(actualCash) || cashBalance); alert("Shift ditutup!"); }}
              className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700">
              Tutup Shift
            </button>
          </div>
        ) : (
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Buka Shift Baru</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Modal Awal Kas</label>
              <input type="number" value={initialCash} onChange={(e) => setInitialCash(e.target.value)}
                className="w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </div>
            <button onClick={() => openShift(Number(initialCash))}
              className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700">
              Buka Shift
            </button>
          </div>
        )}
      </main>
    </>
  );
}
