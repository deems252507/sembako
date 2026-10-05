"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Package, Boxes, Truck, Users,
  Wallet, FileText, Clock, UserCog, Settings, Store, LogOut,
} from "lucide-react";
import { useStore } from "@/store/useStore";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kasir", label: "Kasir", icon: ShoppingCart },
  { href: "/produk", label: "Produk", icon: Package },
  { href: "/stok", label: "Stok", icon: Boxes },
  { href: "/pembelian", label: "Pembelian", icon: Truck },
  { href: "/supplier", label: "Supplier", icon: Store },
  { href: "/pelanggan", label: "Pelanggan", icon: Users },
  { href: "/hutang", label: "Hutang & Piutang", icon: Wallet },
  { href: "/keuangan", label: "Keuangan", icon: Wallet },
  { href: "/laporan", label: "Laporan", icon: FileText },
  { href: "/shift", label: "Shift Kasir", icon: Clock },
  { href: "/pengguna", label: "Pengguna", icon: UserCog },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { storeSettings, logout, user } = useStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#14532d] text-white flex flex-col">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <Store className="h-5 w-5 text-green-300" />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-sm leading-tight truncate">{storeSettings.store_name}</h1>
          <p className="text-[11px] text-green-200/80 truncate">{storeSettings.slogan}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors " +
                (isActive
                  ? "bg-green-500/20 text-white"
                  : "text-green-100/80 hover:bg-white/10 hover:text-white")
              }
            >
              <Icon className={"h-5 w-5 shrink-0 " + (isActive ? "text-green-300" : "")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2 px-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/30 text-sm font-bold">
            {(user?.name || "A").charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
            <p className="text-[11px] text-green-200/70">{user?.role || "OWNER"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-green-100/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
