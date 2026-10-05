"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { storeSettings } from "@/lib/mock-data";
import { Store, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Demo: any credentials work
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 shadow-lg">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-white mb-4">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              {storeSettings.store_name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{storeSettings.slogan}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Username / Email
              </label>
              <input
                type="text"
                required
                defaultValue="admin"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                placeholder="Masukkan username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  defaultValue="admin"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-green-600" />
                Ingat saya
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Demo: username <strong>admin</strong> / password <strong>admin</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
