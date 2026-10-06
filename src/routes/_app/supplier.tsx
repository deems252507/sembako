import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { deleteSupplier, saveSupplier } from "@/lib/pos/actions";
import { usePosStore } from "@/lib/pos/store";
import { formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/_app/supplier")({ component: SupplierPage });

function SupplierPage() {
  const suppliers = usePosStore((s) => s.suppliers);
  const apply = usePosStore((s) => s.apply);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <>
      <PageHeader title="Supplier" />
      <main className="space-y-4 p-4 lg:p-6">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold">Data supplier</h2>
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
                <th className="px-4 py-3 font-medium">Pembelian</th>
                <th className="px-4 py-3 font-medium">Hutang</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b border-border/70">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.phone}</td>
                  <td className="px-4 py-3 tabular">{formatRupiah(s.totalPurchase)}</td>
                  <td className="px-4 py-3 tabular">{formatRupiah(s.debt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button" className="p-2" onClick={() => { setEditId(s.id); setName(s.name); setPhone(s.phone); setOpen(true); }}><Pencil className="h-4 w-4" /></button>
                      <button type="button" className="p-2 text-danger" onClick={async () => { apply(await deleteSupplier({ data: { id: s.id } })); toast.success("Dihapus"); }}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit supplier" : "Supplier baru"}>
        <input className="field" placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="field mt-2" placeholder="Telepon" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button type="button" className="btn-primary mt-4 w-full" onClick={async () => {
          if (!name) return toast.error("Nama wajib");
          apply(await saveSupplier({ data: { id: editId ?? undefined, name, phone } }));
          setOpen(false);
        }}>Simpan</button>
      </Modal>
    </>
  );
}
