import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { deleteStaff, saveStaff } from "@/lib/pos/actions";
import { usePosStore } from "@/lib/pos/store";
import type { Staff } from "@/lib/pos/types";

export const Route = createFileRoute("/_app/pengguna")({ component: PenggunaPage });

function PenggunaPage() {
  const staff = usePosStore((s) => s.staff);
  const apply = usePosStore((s) => s.apply);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Staff["role"]>("Kasir");

  return (
    <>
      <PageHeader title="Pengguna" subtitle="Staf toko (bukan akun login)" />
      <main className="space-y-4 p-4 lg:p-6">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold">Daftar staf</h2>
          <button type="button" className="btn-primary" onClick={() => { setEditId(null); setName(""); setUsername(""); setRole("Kasir"); setOpen(true); }}>
            <Plus className="h-4 w-4" /> Tambah
          </button>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left text-muted">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Peran</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id} className="border-b border-border/70">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3"><span className={u.isActive ? "badge badge-success" : "badge badge-danger"}>{u.isActive ? "Aktif" : "Nonaktif"}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button" className="p-2" onClick={() => { setEditId(u.id); setName(u.name); setUsername(u.username); setRole(u.role); setOpen(true); }}><Pencil className="h-4 w-4" /></button>
                      <button type="button" className="p-2 text-danger" onClick={async () => { apply(await deleteStaff({ data: { id: u.id } })); toast.success("Dihapus"); }}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit staf" : "Staf baru"}>
        <input className="field" placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="field mt-2" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <select className="field mt-2" value={role} onChange={(e) => setRole(e.target.value as Staff["role"])}>
          <option>Kasir</option>
          <option>Administrator</option>
          <option>Owner</option>
        </select>
        <button type="button" className="btn-primary mt-4 w-full" onClick={async () => {
          if (!name || !username) return toast.error("Lengkapi data");
          apply(await saveStaff({ data: { id: editId ?? undefined, name, username, role, isActive: true } }));
          setOpen(false);
        }}>Simpan</button>
      </Modal>
    </>
  );
}
