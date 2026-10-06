import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
});

function ResetPasswordPage() {
  const router = useRouter();
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const tokenOk = useMemo(() => Boolean(token && token.length > 8), [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!tokenOk) {
      setError("Tautan reset tidak valid. Minta ulang dari halaman lupa kata sandi.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (err) throw new Error(err.message || "Gagal mengatur ulang kata sandi.");
      setDone(true);
      window.setTimeout(() => {
        void router.navigate({ to: "/login" });
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengatur ulang kata sandi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-bg px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
          <ArrowLeft className="h-4 w-4" /> Kembali ke login
        </Link>

        <div className="card p-6 sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Kata sandi baru</h1>
          <p className="mt-2 text-sm text-muted">Buat kata sandi baru untuk akun Anda.</p>

          {!tokenOk ? (
            <div className="mt-6 rounded-xl border border-danger/20 bg-red-50 p-4 text-sm text-danger">
              Tautan tidak valid atau kedaluwarsa.{" "}
              <Link to="/lupa-password" className="font-semibold underline">
                Minta tautan baru
              </Link>
            </div>
          ) : done ? (
            <div className="mt-6 rounded-xl border border-accent/20 bg-accent-soft p-4 text-sm text-success">
              Kata sandi berhasil diubah. Mengalihkan ke halaman login…
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Kata sandi baru</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    required
                    minLength={8}
                    className="field pr-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    onClick={() => setShow((v) => !v)}
                    aria-label="Tampilkan kata sandi"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Konfirmasi</label>
                <input
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                  className="field"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Ulangi kata sandi"
                />
              </div>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Menyimpan…" : "Simpan kata sandi"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
