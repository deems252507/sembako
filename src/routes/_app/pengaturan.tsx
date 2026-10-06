import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { saveProfile } from "@/lib/pos/actions";
import { usePosStore } from "@/lib/pos/store";

export const Route = createFileRoute("/_app/pengaturan")({ component: PengaturanPage });

function PengaturanPage() {
  const profile = usePosStore((s) => s.profile);
  const apply = usePosStore((s) => s.apply);
  const [form, setForm] = useState({
    storeName: profile.storeName,
    slogan: profile.slogan,
    address: profile.address,
    phone: profile.phone,
    whatsapp: profile.whatsapp,
    email: profile.email,
    footerReceipt: profile.footerReceipt,
  });

  useEffect(() => {
    setForm({
      storeName: profile.storeName,
      slogan: profile.slogan,
      address: profile.address,
      phone: profile.phone,
      whatsapp: profile.whatsapp,
      email: profile.email,
      footerReceipt: profile.footerReceipt,
    });
  }, [profile]);

  return (
    <>
      <PageHeader title="Pengaturan" />
      <main className="space-y-4 p-4 lg:p-6">
        <div className="card max-w-xl space-y-3 p-6">
          <h2 className="font-semibold">Identitas toko</h2>
          <input className="field" placeholder="Nama toko" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
          <input className="field" placeholder="Slogan" value={form.slogan} onChange={(e) => setForm({ ...form, slogan: e.target.value })} />
          <input className="field" placeholder="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="field" placeholder="Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="field" placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          <input className="field" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea className="field min-h-24" placeholder="Footer struk" value={form.footerReceipt} onChange={(e) => setForm({ ...form, footerReceipt: e.target.value })} />
          <button
            type="button"
            className="btn-primary"
            onClick={async () => {
              apply(await saveProfile({ data: form }));
              toast.success("Pengaturan disimpan di akun toko");
            }}
          >
            Simpan
          </button>
        </div>
      </main>
    </>
  );
}
