"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";

export default function PengaturanPage() {
  const { storeSettings, updateStoreSettings, resetStoreSettings, theme, setTheme } = useStore();
  const [form, setForm] = useState({ ...storeSettings });
  const [saved, setSaved] = useState(false);
  const [dbStatus, setDbStatus] = useState<"loading" | "ok" | "local" | "error">("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setForm({ ...storeSettings });
  }, [storeSettings]);

  // Load from database (Neon) if available
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) {
          if (!cancelled) {
            setDbStatus("local");
            setMsg("Database belum terhubung. Data hanya tersimpan di perangkat ini.");
          }
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        if (data && data.store_name) {
          updateStoreSettings({
            store_name: data.store_name,
            address: data.address || "",
            phone: data.phone || "",
            whatsapp: data.whatsapp || "",
            email: data.email || "",
            slogan: data.slogan || "",
            footer_receipt: data.footer_receipt || "",
            logo: data.logo || null,
          });
          setDbStatus("ok");
          setMsg("Terhubung ke database. Pengaturan sinkron antar perangkat.");
        }
      } catch {
        if (!cancelled) {
          setDbStatus("local");
          setMsg("Database belum terhubung. Data hanya di perangkat ini.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [updateStoreSettings]);

  const handleSave = async () => {
    let footer = form.footer_receipt || "";
    if (!footer.trim()) {
      footer = "Terima kasih telah berbelanja di " + form.store_name + "!";
    }
    const payload = { ...form, footer_receipt: footer };
    updateStoreSettings(payload);
    setForm((f) => ({ ...f, footer_receipt: footer }));

    // Save to database
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setDbStatus("ok");
        setMsg("Tersimpan ke database. Nama toko sama di semua perangkat.");
      } else {
        setDbStatus("local");
        setMsg("Tersimpan di perangkat ini saja (database belum siap).");
      }
    } catch {
      setDbStatus("local");
      setMsg("Tersimpan di perangkat ini saja (database belum siap).");
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (confirm("Kembalikan ke pengaturan default?")) {
      resetStoreSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <>
      <Header title="Pengaturan Toko" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className={
          "rounded-xl px-4 py-3 text-sm border " +
          (dbStatus === "ok"
            ? "bg-green-50 border-green-200 text-green-800"
            : dbStatus === "loading"
            ? "bg-slate-50 border-slate-200 text-slate-600"
            : "bg-amber-50 border-amber-200 text-amber-800")
        }>
          {dbStatus === "loading" ? "Memeriksa database..." : msg}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Profil Toko</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Toko</label>
              <input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alamat</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No HP</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slogan</label>
              <input value={form.slogan || ""} onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Footer Struk</label>
              <textarea value={form.footer_receipt || ""} onChange={(e) => setForm({ ...form, footer_receipt: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" rows={2} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave}
                className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700">
                {saved ? "Tersimpan!" : "Simpan ke Database"}
              </button>
              <button onClick={handleReset}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50">
                Reset
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Preview Struk</h2>
            <div className="border border-dashed border-slate-300 rounded-xl p-5 text-sm font-mono bg-white max-w-xs mx-auto shadow-sm">
              <p className="text-center font-bold text-base">{form.store_name}</p>
              <p className="text-center text-[11px] text-slate-500 mt-0.5">{form.address}</p>
              <p className="text-center text-[11px] text-slate-500">{form.phone}</p>
              <div className="border-t border-dashed border-slate-300 my-3" />
              <p className="text-xs">Invoice: INV-20261005-0001</p>
              <div className="border-t border-dashed border-slate-300 my-3" />
              <div className="flex justify-between font-bold text-sm"><span>Total</span><span>Rp 101.000</span></div>
              <div className="border-t border-dashed border-slate-300 my-3" />
              <p className="text-center text-[11px] text-slate-400">
                {form.footer_receipt || ("Terima kasih telah berbelanja di " + form.store_name + "!")}
              </p>
            </div>
          </div>

          <div className="card p-6 space-y-4 lg:col-span-2">
            <h2 className="text-lg font-semibold">Tampilan</h2>
            <div className="flex gap-3">
              <button type="button" onClick={() => setTheme("light")}
                className={"rounded-xl px-5 py-3 text-sm font-semibold border " + (theme === "light" ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200")}>
                Mode Terang
              </button>
              <button type="button" onClick={() => setTheme("dark")}
                className={"rounded-xl px-5 py-3 text-sm font-semibold border " + (theme === "dark" ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200")}>
                Mode Gelap
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
