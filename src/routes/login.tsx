import { createFileRoute, Navigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, isPending } = useCurrentUserState();

  if (isPending) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#f6f8f7]">
        <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-600" />
        </div>
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" />;
  return <UniversalLogin />;
}

function UniversalLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const changeMode = (nextMode: "masuk" | "daftar") => {
    setMode(nextMode);
    setError("");
    setPassword("");
    setConfirmation("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "daftar" && password !== confirmation) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "daftar") {
        // Keep the existing Better Auth flow intact. The current auth schema
        // stores the user's name/email/password; phone is collected here for
        // the onboarding UX and can be completed in the store profile later.
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0] || "Pengguna",
        });
        if (err) throw new Error(err.message || "Gagal membuat akun.");
      } else {
        const { error: err } = await authClient.signIn.email({
          email,
          password,
        });
        if (err) throw new Error(err.message || "Email atau kata sandi salah.");
      }

      await authClient.getSession();
      await router.invalidate();
      router.navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[#f6f8f7] px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.09)] lg:grid-cols-[0.92fr_1.08fr]">
          <section className="relative hidden overflow-hidden bg-[#103b2b] px-10 py-12 text-white lg:flex lg:min-h-[680px] lg:flex-col lg:justify-between xl:px-14">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-white/10" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                Sistem Manajemen Toko
              </p>
              <h1 className="mt-7 max-w-md text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                Kelola bisnis Anda dengan lebih mudah.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-emerald-50/75">
                Satu sistem untuk membantu mengelola penjualan, stok, kas, pembelian, dan laporan
                dari berbagai jenis toko dan bisnis.
              </p>
            </div>

            <div className="relative grid grid-cols-3 gap-3">
              {[
                ["Penjualan", "Transaksi lebih teratur"],
                ["Persediaan", "Stok lebih terkendali"],
                ["Laporan", "Data mudah dipantau"],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-50/60">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex min-h-[680px] items-center justify-center px-5 py-9 sm:px-10 lg:px-12 xl:px-16">
            <div className="w-full max-w-md">
              <header className="mb-7">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 lg:hidden">
                  Sistem Manajemen Toko
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {mode === "masuk" ? "Selamat datang kembali" : "Buat akun Anda"}
                </h1>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {mode === "masuk"
                    ? "Masuk untuk mengelola toko, penjualan, stok, kas, dan laporan Anda."
                    : "Daftar untuk mulai menyiapkan sistem manajemen toko Anda."}
                </p>
              </header>

              <div className="grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                {(["masuk", "daftar"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => changeMode(item)}
                    className={cn(
                      "rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                      mode === item
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-800",
                    )}
                  >
                    {item === "masuk" ? "Masuk" : "Daftar"}
                  </button>
                ))}
              </div>

              <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
                {error ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                  >
                    {error}
                  </div>
                ) : null}

                {mode === "daftar" ? (
                  <>
                    <Field label="Nama lengkap" icon={<UserRound className="h-4 w-4" />}>
                      <input
                        className="universal-field"
                        type="text"
                        required
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Masukkan nama lengkap"
                      />
                    </Field>

                    <Field label="Nomor HP" icon={<Phone className="h-4 w-4" />}>
                      <input
                        className="universal-field"
                        type="tel"
                        required
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                      />
                    </Field>
                  </>
                ) : null}

                <Field label="Email" icon={<Mail className="h-4 w-4" />}>
                  <input
                    className="universal-field"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@toko.com"
                  />
                </Field>

                <Field label="Kata sandi" icon={<LockKeyhole className="h-4 w-4" />}>
                  <div className="relative">
                    <input
                      className="universal-field pr-12"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete={mode === "daftar" ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                    />
                    <PasswordToggle
                      visible={showPassword}
                      onClick={() => setShowPassword((value) => !value)}
                      label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    />
                  </div>
                </Field>

                {mode === "daftar" ? (
                  <Field label="Konfirmasi kata sandi" icon={<LockKeyhole className="h-4 w-4" />}>
                    <div className="relative">
                      <input
                        className="universal-field pr-12"
                        type={showConfirmation ? "text" : "password"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        placeholder="Ulangi kata sandi"
                      />
                      <PasswordToggle
                        visible={showConfirmation}
                        onClick={() => setShowConfirmation((value) => !value)}
                        label={
                          showConfirmation
                            ? "Sembunyikan konfirmasi kata sandi"
                            : "Tampilkan konfirmasi kata sandi"
                        }
                      />
                    </div>
                  </Field>
                ) : null}

                {mode === "masuk" ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setError("Silakan hubungi administrator aplikasi untuk proses pemulihan kata sandi.")}
                      className="text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800 hover:underline"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(4,120,87,0.18)] transition-all hover:bg-emerald-800 hover:shadow-[0_12px_28px_rgba(4,120,87,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Memproses…" : mode === "daftar" ? "Buat akun" : "Masuk ke aplikasi"}
                </button>
              </form>

              {mode === "daftar" ? (
                <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                  Setelah akun dibuat, pengaturan identitas toko dapat dilengkapi dari dalam aplikasi.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="text-slate-400">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}

function PasswordToggle({
  visible,
  onClick,
  label,
}: {
  visible: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
    >
      {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  );
}
