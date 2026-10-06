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

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/kasir", label: "Kasir", icon: ShoppingCart },
  { to: "/produk", label: "Produk", icon: Package },
  { to: "/stok", label: "Stok", icon: Boxes },
  { to: "/pembelian", label: "Pembelian", icon: Truck },
  { to: "/supplier", label: "Supplier", icon: Store },
  { to: "/pelanggan", label: "Pelanggan", icon: Users },
  { to: "/hutang", label: "Hutang & Piutang", icon: Wallet },
  { to: "/keuangan", label: "Keuangan", icon: Wallet },
  { to: "/laporan", label: "Laporan", icon: FileText },
  { to: "/shift", label: "Shift Kasir", icon: Clock },
  { to: "/pengguna", label: "Pengguna", icon: UserCog },
  { to: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const profile = usePosStore((s) => s.profile);

  return (
    <aside className="flex h-full w-64 flex-col bg-ink text-ink-fg lg:fixed lg:inset-y-0 lg:left-0 lg:z-40">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Store className="h-5 w-5 text-accent-soft" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-base leading-tight">{profile.storeName}</p>
          <p className="truncate text-[11px] text-ink-muted">{profile.slogan}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {NAV.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-white/12 text-ink-fg"
                  : "text-ink-muted hover:bg-white/8 hover:text-ink-fg",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="rounded-xl bg-white/6 px-2 py-2 text-ink-fg [&_span]:text-ink-fg [&_button]:text-ink-muted">
          <UserButton />
        </div>
      </div>
    </aside>
  );
}
