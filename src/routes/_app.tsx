import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { AppShell, ShellSkeleton } from "@/components/app-shell";
import { usePosStore } from "@/lib/pos/store";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  const { user, isPending } = useCurrentUserState();
  const bootstrap = usePosStore((s) => s.bootstrap);
  const status = usePosStore((s) => s.status);
  const error = usePosStore((s) => s.error);

  useEffect(() => {
    if (user) void bootstrap(user.id);
  }, [user, bootstrap]);

  if (isPending) return <ShellSkeleton />;
  if (!user) return <RedirectToSignIn />;
  if (status === "loading" || status === "idle") return <ShellSkeleton />;
  if (status === "error") {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg p-6">
        <div className="card max-w-md p-6 text-center">
          <h1 className="font-display text-2xl">Toko belum siap</h1>
          <p className="mt-2 text-sm text-muted">{error || "Gagal memuat data toko."}</p>
          <button
            type="button"
            className="btn-primary mt-4"
            onClick={() => void bootstrap(user.id)}
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
