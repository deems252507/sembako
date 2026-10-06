import { createFileRoute, Navigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Store } from "lucide-react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-ink paper-grain">
        <div className="h-12 w-48 animate-pulse rounded-xl bg-white/10" />
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" />;
  return <LuxuryLogin />;
}

function LuxuryLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "daftar") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "Pemilik toko",
        });
        if (err) throw new Error(err.message || "Gagal daftar");
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message || "Email atau kata sandi salah");
      }
      await authClient.getSession();
      await router.invalidate();
      router.navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-bg lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-ink paper-grain text-ink-fg lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/8">
              <Store className="h-5 w-5" />
            </div>
            <p className="text-sm tracking-[0.22em] uppercase text-ink-muted">Sistem kasir</p>
          </div>
          <h1 className="mt-16 max-w-lg font-display text-6xl leading-[1.05] tracking-tight">
            Warung
            <br />
            Makmur
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-ink-muted">
            Kasir yang tenang, stok yang jujur, pembelian yang bisa dihapus tanpa jejak kacau.
          </p>
        </div>
        <ShelfMark />
        <ul className="grid max-w-md grid-cols-3 gap-6 text-sm text-ink-muted">
          <li>
            <p className="font-display text-2xl text-ink-fg">Scan</p>
            Kamera & USB
          </li>
          <li>
            <p className="font-display text-2xl text-ink-fg">Stok</p>
            Masuk-keluar rapi
          </li>
          <li>
            <p className="font-display text-2xl text-ink-fg">Bon</p>
            Hutang tercatat
          </li>
        </ul>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Sistem kasir</p>
            <h1 className="font-display text-4xl tracking-tight">Warung Makmur</h1>
          </div>
          <p className="text-sm text-muted">Masuk ke toko Anda</p>
          <h2 className="mt-1 font-display text-3xl tracking-tight">Selamat datang kembali</h2>

          <div className="mt-6 grid grid-cols-2 rounded-xl bg-surface p-1 ring-1 ring-border">
            {(["masuk", "daftar"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={cn(
                  "rounded-lg py-2.5 text-sm font-semibold capitalize",
                  mode === m ? "bg-elevated text-fg shadow-sm" : "text-muted",
                )}
              >
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
            {error ? (
              <p className="rounded-xl border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            ) : null}
            {mode === "daftar" ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Nama toko / pemilik</span>
                <input
                  className="field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                />
              </label>
            ) : null}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Email</span>
              <input
                className="field"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@toko.com"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Kata sandi</span>
              <div className="relative">
                <input
                  className="field pr-12"
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete={mode === "daftar" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Memproses…" : mode === "daftar" ? "Buat akun toko" : "Masuk ke kasir"}
            </button>
          </form>

          {authEnabled ? (
            <div className="mt-6">
              <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-subtle">
                <span className="h-px flex-1 bg-border" />
                atau lanjut dengan
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-2">
                {GROK_PROVIDERS.map((p) => (
                  <button
                    key={p.providerId}
                    type="button"
                    onClick={() => void signIn(p.providerId, { callbackURL: "/dashboard" })}
                    className="btn-ghost w-full"
                  >
                    Lanjut dengan {p.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">Masuk sedang dinonaktifkan.</p>
          )}
        </div>
      </section>
    </main>
  );
}

function ShelfMark() {
  return (
    <svg viewBox="0 0 420 180" className="my-10 w-full max-w-md text-ink-fg/80" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="24" y="28" width="372" height="128" rx="6" opacity="0.45" />
        <path d="M24 70h372M24 112h372" opacity="0.45" />
        <rect x="48" y="40" width="54" height="22" rx="3" />
        <rect x="118" y="40" width="72" height="22" rx="3" />
        <rect x="210" y="40" width="44" height="22" rx="3" />
        <rect x="48" y="82" width="88" height="22" rx="3" />
        <rect x="154" y="82" width="50" height="22" rx="3" />
        <rect x="224" y="82" width="66" height="22" rx="3" />
        <rect x="48" y="124" width="40" height="22" rx="3" />
        <rect x="106" y="124" width="96" height="22" rx="3" />
        <rect x="220" y="124" width="58" height="22" rx="3" />
      </g>
    </svg>
  );
}
