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
  const todaySales = sales.filter((s) => s.date.slice(0, 10) === today);
  const omzet = todaySales.reduce((s, t) => s + t.total, 0);
  const laba = todaySales.reduce((s, t) => {
    const hpp = t.items.reduce((h, i) => h + i.buyPrice * i.qty, 0);
    return s + (t.total - hpp);
  }, 0);
  const piutang = customers.reduce((s, c) => s + c.debtRemaining, 0);
  const hutang = suppliers.reduce((s, s2) => s + s2.debt, 0);

  const chart = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      date: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      penjualan: sales.filter((s) => s.date.slice(0, 10) === key).reduce((n, t) => n + t.total, 0),
      pembelian: purchases.filter((p) => p.date === key).reduce((n, t) => n + t.total, 0),
    };
  });

  const sold: Record<string, { name: string; qty: number; unit: string }> = {};
  for (const sale of sales) {
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
      <main className="space-y-6 p-4 lg:p-6">
        <div>
          <h2 className="font-display text-2xl tracking-tight">
            Selamat datang, {user?.displayName || "Pemilik"}
          </h2>
          <p className="text-sm text-muted">{profile.storeName}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat title="Omzet hari ini" value={formatRupiah(omzet)} icon={TrendingUp} />
          <Stat title="Transaksi hari ini" value={String(todaySales.length)} icon={ShoppingBag} />
          <Stat title="Laba kotor hari ini" value={formatRupiah(laba)} icon={Wallet} />
          <Stat title="Kas tersedia" value={formatRupiah(profile.cashBalance)} icon={Wallet} />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="card p-5 xl:col-span-2">
            <h3 className="mb-4 font-semibold">Penjualan 7 hari</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2ddd2" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7268" }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7268" }}
                    tickFormatter={(v) => `${Math.round(Number(v) / 1000)}rb`}
                  />
                  <Tooltip formatter={(v: number) => formatRupiah(v)} />
                  <Bar dataKey="penjualan" fill="#2f6f4e" radius={[4, 4, 0, 0]} name="Penjualan" />
                  <Bar dataKey="pembelian" fill="#c5d9cc" radius={[4, 4, 0, 0]} name="Pembelian" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card p-5">
            <h3 className="mb-4 font-semibold">Produk terlaris</h3>
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
    <div className="card flex items-start justify-between p-5">
      <div>
        <p className="text-sm text-muted">{title}</p>
        <p className="mt-1 text-2xl font-semibold tabular">{value}</p>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-success">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
