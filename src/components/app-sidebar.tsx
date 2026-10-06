import { Link, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  Clock,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { usePosStore } from "@/lib/pos/store";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };
type NavGroup = { label?: string; items: NavItem[] };

/** Same routes as before — only visual grouping */
const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Transaksi",
    items: [
      { to: "/kasir", label: "Penjualan", icon: ShoppingCart },
      { to: "/laporan", label: "Riwayat Transaksi", icon: FileText },
    ],
  },
  {
    label: "Produk",
    items: [
      { to: "/produk", label: "Daftar Barang", icon: Package },
      { to: "/stok", label: "Stok", icon: Boxes },
      { to: "/pembelian", label: "Pembelian", icon: Truck },
    ],
  },
  {
    label: "Mitra",
    items: [
      { to: "/pelanggan", label: "Pelanggan", icon: Users },
      { to: "/supplier", label: "Supplier", icon: Store },
      { to: "/hutang", label: "Hutang & Piutang", icon: Wallet },
    ],
  },
  {
    label: "Keuangan",
    items: [
      { to: "/keuangan", label: "Kas & Keuangan", icon: Wallet },
      { to: "/shift", label: "Shift Kasir", icon: Clock },
    ],
  },
  {
    label: "Sistem",
    items: [
      { to: "/pengguna", label: "Pengguna", icon: UserCog },
      { to: "/pengaturan", label: "Pengaturan", icon: Settings },
    ],
  },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const profile = usePosStore((s) => s.profile);

  return (
    <aside className="flex h-full w-[15.5rem] flex-col bg-ink text-ink-fg lg:fixed lg:inset-y-0 lg:left-0 lg:z-40">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg shadow-sm">
          <Store className="h-4.5 w-4.5 h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight tracking-tight">
            {profile.storeName || "Toko Sembako"}
          </p>
          <p className="truncate text-[11px] text-ink-muted">Manajemen Toko</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-1" : ""}>
            {group.label ? <p className="nav-group-label">{group.label}</p> : null}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.to || pathname.startsWith(`${item.to}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={cn("nav-item", active && "nav-item-active")}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-90" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-2">
          <UserButton />
        </div>
      </div>
    </aside>
  );
}
