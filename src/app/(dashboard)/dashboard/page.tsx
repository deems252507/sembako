"use client";

import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";
import {
  TrendingUp, ShoppingBag, DollarSign, Wallet, ArrowUpRight, Package,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { salesChartData, topProducts } from "@/lib/mock-data";

export default function DashboardPage() {
  const { transactions, products, cashBalance, storeSettings, user, customers, suppliers } = useStore();

  const todayOmzet = transactions.reduce((s, t) => s + t.total, 0);
  const totalTrx = transactions.length;
  const labaKotor = transactions.reduce((s, t) => {
    const hpp = t.items.reduce((h, i) => h + (i.product.buy_price || 0) * i.qty, 0);
    return s + (t.total - hpp);
  }, 0);
  const totalPiutang = customers.reduce((s, c) => s + c.sisaHutang, 0);
  const totalHutang = suppliers.reduce((s, s2) => s + s2.hutang, 0);

  const statsCards = [
    {
      title: "Omzet Hari Ini",
      value: formatRupiah(todayOmzet || 0),
      change: todayOmzet > 0 ? 12 : null,
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Total Transaksi",
      value: String(totalTrx || 0),
      change: totalTrx > 0 ? 8 : null,
      icon: ShoppingBag,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Laba Kotor",
      value: formatRupiah(labaKotor || 0),
      change: labaKotor > 0 ? 15 : null,
      icon: DollarSign,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Kas Tersedia",
      value: formatRupiah(cashBalance),
      change: null,
      icon: Wallet,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      subtitle: "Saldo kas",
    },
  ];

  return (
    <>
      <Header title="Dashboard" />
      <main className="p-4 lg:p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Selamat datang, {user?.name || "Admin"}
          </h2>
          <p className="text-sm text-slate-500">{storeSettings.store_name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="card p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{card.title}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
                  </div>
                  <div className={"flex h-10 w-10 items-center justify-center rounded-xl " + card.iconBg}>
                    <Icon className={"h-5 w-5 " + card.iconColor} />
                  </div>
                </div>
                {card.change !== null && card.change !== undefined ? (
                  <div className="flex items-center gap-1 text-xs">
                    <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-600 font-medium">+{card.change}%</span>
                    <span className="text-slate-400">dari kemarin</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">{card.subtitle}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="card p-5 xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Grafik Penjualan 7 Hari Terakhir</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => (v / 1000000).toFixed(0) + "jt"} />
                  <Tooltip formatter={(value: number) => formatRupiah(value)} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="penjualan" fill="#22c55e" radius={[4, 4, 0, 0]} name="Penjualan" />
                  <Bar dataKey="pembelian" fill="#bbf7d0" radius={[4, 4, 0, 0]} name="Pembelian" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Produk Terlaris</h3>
            <div className="space-y-3">
              {topProducts.map((product) => (
                <div key={product.rank} className="flex items-center gap-3">
                  <span className={
                    "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold " +
                    (product.rank === 1 ? "bg-green-100 text-green-700" : product.rank === 2 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600")
                  }>
                    {product.rank}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Package className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{product.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">{product.sold} {product.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="text-sm text-slate-500">Piutang Pelanggan</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{formatRupiah(totalPiutang)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">Hutang Supplier</p>
            <p className="text-xl font-bold text-red-600 mt-1">{formatRupiah(totalHutang)}</p>
          </div>
        </div>

        {/* Recent transactions */}
        {transactions.length > 0 && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Transaksi Terbaru</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Invoice</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Kasir</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Metode</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((t) => (
                    <tr key={t.id} className="border-b border-slate-50">
                      <td className="px-4 py-3 font-medium text-green-600">{t.invoice}</td>
                      <td className="px-4 py-3">{t.cashier}</td>
                      <td className="px-4 py-3 capitalize">{t.payment_method}</td>
                      <td className="px-4 py-3 font-medium">{formatRupiah(t.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
