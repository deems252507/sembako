"use client";

import Header from "@/components/Header";
import {
  dashboardStats,
  salesChartData,
  topProducts,
  storeSettings,
  currentUser,
} from "@/lib/mock-data";
import { formatRupiah } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Package,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const statsCards = [
  {
    title: "Omzet Hari Ini",
    value: formatRupiah(dashboardStats.omzet_hari_ini),
    change: dashboardStats.omzet_change,
    icon: TrendingUp,
    color: "bg-green-50 text-green-600",
    iconBg: "bg-green-100",
  },
  {
    title: "Total Transaksi",
    value: dashboardStats.total_transaksi.toString(),
    change: dashboardStats.transaksi_change,
    icon: ShoppingBag,
    color: "bg-blue-50 text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    title: "Laba Kotor",
    value: formatRupiah(dashboardStats.laba_kotor),
    change: dashboardStats.laba_change,
    icon: DollarSign,
    color: "bg-amber-50 text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    title: "Kas Tersedia",
    value: formatRupiah(dashboardStats.kas_tersedia),
    change: null,
    icon: Wallet,
    color: "bg-purple-50 text-purple-600",
    iconBg: "bg-purple-100",
    subtitle: "Saldo hari ini",
  },
];

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <main className="p-4 lg:p-6 space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Selamat datang, {currentUser.name}
          </h2>
          <p className="text-sm text-slate-500">{storeSettings.store_name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="card p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{card.title}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${card.color.split(" ")[1]}`} />
                  </div>
                </div>
                {card.change !== null && card.change !== undefined ? (
                  <div className="flex items-center gap-1 text-xs">
                    <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-600 font-medium">
                      +{card.change}%
                    </span>
                    <span className="text-slate-400">dari kemarin</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">{card.subtitle}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Chart + Top Products */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <div className="card p-5 xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">
                Grafik Penjualan 7 Hari Terakhir
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  Penjualan
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-200" />
                  Pembelian
                </span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="penjualan"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    name="Penjualan"
                  />
                  <Bar
                    dataKey="pembelian"
                    fill="#bbf7d0"
                    radius={[4, 4, 0, 0]}
                    name="Pembelian"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">
              Produk Terlaris
            </h3>
            <div className="space-y-3">
              {topProducts.map((product) => (
                <div
                  key={product.rank}
                  className="flex items-center gap-3"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                      product.rank === 1
                        ? "bg-green-100 text-green-700"
                        : product.rank === 2
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {product.rank}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Package className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {product.name}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">
                    {product.sold} {product.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Extra cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="text-sm text-slate-500">Piutang Pelanggan</p>
            <p className="text-xl font-bold text-amber-600 mt-1">
              {formatRupiah(dashboardStats.piutang)}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">Hutang Supplier</p>
            <p className="text-xl font-bold text-red-600 mt-1">
              {formatRupiah(dashboardStats.hutang_supplier)}
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
