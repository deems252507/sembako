import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/lupa-password")({
  component: LupaPasswordPage,
});

function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/reset-password`;

      // Better Auth: requestPasswordReset (baru) atau forgetPassword (lama)
      const client = authClient as typeof authClient & {
        requestPasswordReset?: (args: { email: string; redirectTo?: string }) => Promise<{ error?: { message?: string } | null }>;
        forgetPassword?: (args: { email: string; redirectTo?: string }) => Promise<{ error?: { message?: string } | null }>;
      };

      let err: { message?: string } | null | undefined;
      if (typeof client.requestPasswordReset === "function") {
        const res = await client.requestPasswordReset({ email: email.trim(), redirectTo });
        err = res.error;
      } else if (typeof client.forgetPassword === "function") {
        const res = await client.forgetPassword({ email: email.trim(), redirectTo });
        err = res.error;
      } else {
        throw new Error("Fitur reset password belum tersedia di client auth.");
      }

      if (err) throw new Error(err.message || "Gagal mengirim email reset.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim email reset.");
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
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Lupa kata sandi</h1>
          <p className="mt-2 text-sm text-muted">
            Masukkan email akun Anda. Kami akan mengirim tautan untuk mengatur ulang kata sandi.
          </p>

          {sent ? (
            <div className="mt-6 rounded-xl border border-accent/20 bg-accent-soft p-4 text-sm text-success">
              Jika email <strong>{email}</strong> terdaftar, tautan reset sudah dikirim.
              Periksa kotak masuk dan folder spam. Tautan biasanya berlaku terbatas.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted">Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="field"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Mengirim…" : "Kirim tautan reset"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
