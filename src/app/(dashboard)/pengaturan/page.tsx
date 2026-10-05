"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";

export default function PengaturanPage() {
  const { storeSettings, updateStoreSettings } = useStore();
  const [form, setForm] = useState({ ...storeSettings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateStoreSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" rows={2} />
            </div>
            <button onClick={handleSave}
              className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700">
              {saved ? "✓ Tersimpan!" : "Simpan Perubahan"}
            </button>
          </div>

          {/* Preview Struk */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Preview Struk</h2>
            <div className="border border-dashed border-slate-300 rounded-xl p-4 text-sm font-mono bg-slate-50">
              <p className="text-center font-bold text-base">{form.store_name}</p>
              <p className="text-center text-xs text-slate-500">{form.address}</p>
              <p className="text-center text-xs text-slate-500">{form.phone}</p>
              <hr className="my-2 border-slate-300" />
              <p>Invoice: INV-20261005-0001</p>
              <p>Kasir: Admin</p>
              <p>Tanggal: 05/10/2026 14:00</p>
              <hr className="my-2 border-slate-300" />
              <div className="flex justify-between"><span>Beras 5 Kg x1</span><span>Rp 65.000</span></div>
              <div className="flex justify-between"><span>Minyak Goreng x2</span><span>Rp 36.000</span></div>
              <hr className="my-2 border-slate-300" />
              <div className="flex justify-between font-bold"><span>Total</span><span>Rp 101.000</span></div>
              <div className="flex justify-between"><span>Bayar</span><span>Rp 105.000</span></div>
              <div className="flex justify-between"><span>Kembali</span><span>Rp 4.000</span></div>
              <hr className="my-2 border-slate-300" />
              <p className="text-center text-xs text-slate-400 mt-2">{form.footer_receipt}</p>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">Preview berubah otomatis saat data diubah</p>
          </div>
        </div>
      </main>
    </>
  );
}
