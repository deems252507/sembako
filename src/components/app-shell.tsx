import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  ShoppingCart,
} from "lucide-react";
import { AppSidebar } from "./app-sidebar";
import { cn } from "@/lib/utils";

const MOBILE_TABS = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/kasir", label: "Kasir", icon: ShoppingCart },
  { to: "/produk", label: "Produk", icon: Package },
  { to: "/laporan", label: "Laporan", icon: FileText },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("open-mobile-menu", onOpen);
    return () => window.removeEventListener("open-mobile-menu", onOpen);
  }, []);

  return (
    <div className="min-h-dvh bg-bg">
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            <AppSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="lg:pl-[15.5rem]">
        <div className="pb-20 lg:pb-0">{children}</div>
      </div>

      {/* Mobile bottom nav — visual only, same routes */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md pb-safe lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
          {MOBILE_TABS.map((tab) => {
            const active =
              pathname === tab.to || pathname.startsWith(`${tab.to}/`);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-accent" : "text-muted hover:text-fg",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.25]")} />
                <span className="truncate">{tab.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium text-muted hover:text-fg"
          >
            <Menu className="h-5 w-5" />
            <span>Menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export function ShellSkeleton() {
  return (
    <div className="min-h-dvh bg-bg">
      <div className="hidden lg:block">
        <aside className="fixed inset-y-0 left-0 w-[15.5rem] bg-ink" />
      </div>
      <div className="lg:pl-[15.5rem]">
        <div className="h-14 border-b border-border bg-surface lg:h-16" />
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      </div>
    </div>
  );
}
