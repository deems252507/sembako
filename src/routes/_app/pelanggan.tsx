import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { deleteCustomer, saveCustomer } from "@/lib/pos/actions";
import { usePosStore } from "@/lib/pos/store";
import { formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/_app/pelanggan")({ component: PelangganPage });

function PelangganPage() {
  const customers = usePosStore((s) => s.customers);
  const apply = usePosStore((s) => s.apply);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const piutang = customers.reduce((s, c) => s + c.debtRemaining, 0);

  return (
    <>
      <PageHeader title="Pelanggan" />
      <main className="space-y-4 p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card p-5"><p className="text-sm text-muted">Total</p><p className="text-2xl font-semibold">{customers.length}</p></div>
          <div className="card p-5"><p className="text-sm text-muted">Piutang</p><p className="text-2xl font-semibold text-warning tabular">{formatRupiah(piutang)}</p></div>
          <div className="card p-5"><p className="text-sm text-muted">Lunas</p><p className="text-2xl font-semibold text-success">{customers.filter((c) => c.debtRemaining === 0).length}</p></div>
        </div>
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold">Data pelanggan</h2>
          <button type="button" className="btn-primary" onClick={() => { setEditId(null); setName(""); setPhone(""); setOpen(true); }}>
            <Plus className="h-4 w-4" /> Tambah
          </button>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left text-muted">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Telepon</th>
                <th className="px-4 py-3 font-medium">Belanja</th>
                <th className="px-4 py-3 font-medium">Sisa hutang</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border/70">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3 tabular">{formatRupiah(c.totalSpent)}</td>
                  <td className="px-4 py-3 tabular">{formatRupiah(c.debtRemaining)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button" className="p-2" onClick={() => { setEditId(c.id); setName(c.name); setPhone(c.phone); setOpen(true); }}><Pencil className="h-4 w-4" /></button>
                      <button type="button" className="p-2 text-danger" onClick={async () => { apply(await deleteCustomer({ data: { id: c.id } })); toast.success("Dihapus"); }}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit pelanggan" : "Pelanggan baru"}>
        <input className="field" placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="field mt-2" placeholder="Telepon" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button type="button" className="btn-primary mt-4 w-full" onClick={async () => {
          if (!name) return toast.error("Nama wajib");
          apply(await saveCustomer({ data: { id: editId ?? undefined, name, phone } }));
          setOpen(false);
        }}>Simpan</button>
      </Modal>
    </>
  );
}
