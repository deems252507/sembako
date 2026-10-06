import { createFileRoute } from "@tanstack/react-router";
import { Package, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/ui/page-header";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { usePosStore } from "@/lib/pos/store";
import { formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({ component: DashboardPage });

function DashboardPage() {
  const user = useCurrentUser();
  const sales = usePosStore((s) => s.sales);
  const products = usePosStore((s) => s.products);
  const purchases = usePosStore((s) => s.purchases);
  const customers = usePosStore((s) => s.customers);
  const suppliers = usePosStore((s) => s.suppliers);
  const profile = usePosStore((s) => s.profile);

  const today = new Date().toISOString().slice(0, 10);
  const activeSales = sales.filter((s) => s.status !== "batal");
  const todaySales = activeSales.filter((s) => s.date.slice(0, 10) === today);
  const omzet = todaySales.reduce((s, t) => s + t.total, 0);
  const omzetAll = activeSales.reduce((s, t) => s + t.total, 0);
  const laba = todaySales.reduce((s, t) => {
    const hpp = t.items.reduce((h, i) => h + i.buyPrice * i.qty, 0);
    return s + (t.total - hpp);
  }, 0);
  let cashToday = 0;
  let qrisToday = 0;
  let tfToday = 0;
  for (const t of todaySales) {
    if (t.isDebt) continue;
    if (t.paymentMethod === "tunai") cashToday += t.total;
    else if (t.paymentMethod === "qris") qrisToday += t.total;
    else if (t.paymentMethod === "transfer") tfToday += t.total;
  }
  const piutang = customers.reduce((s, c) => s + c.debtRemaining, 0);
  const hutang = suppliers.reduce((s, s2) => s + s2.debt, 0);
  const trxCount = todaySales.length;

  const chart = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      penjualan: activeSales.filter((s) => s.date.slice(0, 10) === key).reduce((n, t) => n + t.total, 0),
      pembelian: purchases.filter((p) => p.date === key).reduce((n, t) => n + t.total, 0),
    };
  });

  const sold: Record<string, { name: string; qty: number; unit: string }> = {};
  for (const sale of activeSales) {
    for (const item of sale.items) {
      const cur = sold[item.productId] || {
        name: item.name,
        qty: 0,
        unit: products.find((p) => p.id === item.productId)?.unit || "pcs",
      };
      cur.qty += item.qty;
      sold[item.productId] = cur;
    }
  }
  const top = Object.values(sold)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" subtitle={profile.storeName} />
      <main className="page-main space-y-5 p-4 lg:p-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-fg lg:text-2xl">
            Selamat datang, {user?.displayName || "Admin"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Berikut ringkasan kondisi toko Anda hari ini.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat title="Omzet hari ini" value={formatRupiah(omzet)} icon={TrendingUp} />
          <Stat title="Transaksi hari ini" value={String(todaySales.length)} icon={ShoppingBag} />
          <Stat title="Laba kotor hari ini" value={formatRupiah(laba)} icon={Wallet} />
          <Stat title="Kas tersedia" value={formatRupiah(profile.cashBalance)} icon={Wallet} />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="card p-5 xl:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-fg">Penjualan 7 hari</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ebe7" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(v) => `${Math.round(Number(v) / 1000)}rb`}
                  />
                  <Tooltip formatter={(v: number) => formatRupiah(v)} />
                  <Bar dataKey="penjualan" fill="#1b7a4e" radius={[4, 4, 0, 0]} name="Penjualan" />
                  <Bar dataKey="pembelian" fill="#b8dcc8" radius={[4, 4, 0, 0]} name="Pembelian" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-fg">Produk terlaris</h3>
            {top.length === 0 ? (
              <p className="text-sm text-muted">Belum ada penjualan.</p>
            ) : (
              <div className="space-y-3">
                {top.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-soft text-xs font-bold text-success">
                      {i + 1}
                    </span>
                    <Package className="h-4 w-4 text-subtle" />
                    <p className="flex-1 truncate text-sm">{p.name}</p>
                    <span className="text-sm font-semibold">
                      {p.qty} {p.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="card p-4">
            <p className="text-xs text-muted">Omzet semua</p>
            <p className="mt-1 text-lg font-semibold tabular">{formatRupiah(omzetAll)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-muted">Tunai hari ini</p>
            <p className="mt-1 text-lg font-semibold tabular">{formatRupiah(cashToday)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-muted">QRIS hari ini</p>
            <p className="mt-1 text-lg font-semibold tabular">{formatRupiah(qrisToday)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-muted">Transfer hari ini</p>
            <p className="mt-1 text-lg font-semibold tabular">{formatRupiah(tfToday)}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <p className="text-sm text-muted">Piutang pelanggan</p>
            <p className="mt-1 font-display text-2xl text-warning tabular">{formatRupiah(piutang)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-muted">Hutang supplier</p>
            <p className="mt-1 font-display text-2xl text-danger tabular">{formatRupiah(hutang)}</p>
          </div>
        </div>
      </main>
    </>
  );
}

function Stat({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="card-stat flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{title}</p>
        <p className="mt-1 truncate text-xl font-semibold tracking-tight tabular lg:text-2xl">{value}</p>
      </div>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-success">
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
}
