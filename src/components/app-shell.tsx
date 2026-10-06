import { useEffect, useState, type ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

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
            className="absolute inset-0 bg-ink/40"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl">
            <AppSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}

export function ShellSkeleton() {
  return (
    <div className="min-h-dvh bg-bg">
      <div className="hidden lg:block">
        <aside className="fixed inset-y-0 left-0 w-64 bg-ink" />
      </div>
      <div className="lg:pl-64">
        <div className="h-16 border-b border-border" />
        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-28 animate-pulse bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
