"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";

export default function PengaturanPage() {
  const { storeSettings, updateStoreSettings, resetStoreSettings } = useStore();
  const [form, setForm] = useState({ ...storeSettings });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({ ...storeSettings });
  }, [storeSettings]);

  const handleSave = () => {
    // Auto-update footer if still contains old default shop name
    let footer = form.footer_receipt || "";
    if (footer.includes("Warung Sembako Makmur") || footer.includes("Makmur")) {
      footer = "Terima kasih telah berbelanja di " + form.store_name + "!";
    }
    if (!footer.trim()) {
      footer = "Terima kasih telah berbelanja di " + form.store_name + "!";
    }
    updateStoreSettings({ ...form, footer_receipt: footer });
    setForm((f) => ({ ...f, footer_receipt: footer }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
      <main className="p-4 lg:p-6">
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
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" rows={2}
                placeholder="Terima kasih telah berbelanja di ..." />
              <p className="text-xs text-slate-400 mt-1">Ubah juga teks footer ini supaya struk tidak masih tulis Makmur</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave}
                className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700">
                {saved ? "Tersimpan!" : "Simpan Perubahan"}
              </button>
              <button onClick={handleReset}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50">
                Reset Default
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Preview Struk</h2>
            <div className="border border-dashed border-slate-300 rounded-xl p-5 text-sm font-mono bg-white max-w-xs mx-auto shadow-sm">
              <p className="text-center font-bold text-base tracking-wide">{form.store_name}</p>
              <p className="text-center text-[11px] text-slate-500 mt-0.5">{form.address}</p>
              <p className="text-center text-[11px] text-slate-500">{form.phone}</p>
              <div className="border-t border-dashed border-slate-300 my-3" />
              <p className="text-xs">Invoice: INV-20261005-0001</p>
              <p className="text-xs">Kasir: Admin</p>
              <div className="border-t border-dashed border-slate-300 my-3" />
              <div className="flex justify-between text-xs"><span>Beras 5 Kg x1</span><span>Rp 65.000</span></div>
              <div className="flex justify-between text-xs mt-1"><span>Minyak Goreng x2</span><span>Rp 36.000</span></div>
              <div className="border-t border-dashed border-slate-300 my-3" />
              <div className="flex justify-between font-bold text-sm"><span>Total</span><span>Rp 101.000</span></div>
              <div className="border-t border-dashed border-slate-300 my-3" />
              <p className="text-center text-[11px] text-slate-400 mt-1">
                {form.footer_receipt || ("Terima kasih telah berbelanja di " + form.store_name + "!")}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
