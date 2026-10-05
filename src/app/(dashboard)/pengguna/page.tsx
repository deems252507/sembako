"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { Pencil, KeyRound, X, Plus } from "lucide-react";

type UserRow = { id: string; name: string; username: string; role: string; status: string };

const initialUsers: UserRow[] = [
  { id: "1", name: "Admin", username: "admin", role: "Administrator", status: "Aktif" },
  { id: "2", name: "Kasir Pagi", username: "pagi", role: "Kasir", status: "Aktif" },
  { id: "3", name: "Kasir Siang", username: "siang", role: "Kasir", status: "Aktif" },
];

export default function PenggunaPage() {
  const [users, setUsers] = useState(initialUsers);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [pwdUser, setPwdUser] = useState<UserRow | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Kasir");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const openEdit = (u: UserRow) => {
    setEditUser(u);
    setName(u.name);
    setUsername(u.username);
    setRole(u.role);
  };

  const saveEdit = () => {
    if (!editUser) return;
    setUsers(users.map((u) => (u.id === editUser.id ? { ...u, name, username, role } : u)));
    setEditUser(null);
    alert("Data pengguna diperbarui");
  };

  const savePassword = () => {
    if (!password || password.length < 4) return alert("Password minimal 4 karakter");
    if (password !== password2) return alert("Konfirmasi password tidak sama");
    setPwdUser(null);
    setPassword("");
    setPassword2("");
    alert("Password berhasil diubah");
  };

  return (
    <>
      <Header title="Pengguna" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Daftar Pengguna</h2>
          <button
            onClick={() => {
              const id = String(Date.now());
              setUsers([...users, { id, name: "User Baru", username: "user" + id.slice(-4), role: "Kasir", status: "Aktif" }]);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" /> Tambah Pengguna
          </button>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-4 py-3 text-left font-medium text-slate-500">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Username</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Role</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3"><span className="badge badge-success">{u.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setPwdUser(u)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Ubah Password">
                        <KeyRound className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditUser(null)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Edit Pengguna</h3>
                <button onClick={() => setEditUser(null)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                    <option>Administrator</option>
                    <option>Kasir</option>
                  </select>
                </div>
                <button onClick={saveEdit} className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white">Simpan</button>
              </div>
            </div>
          </div>
        )}

        {pwdUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setPwdUser(null)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Ubah Password — {pwdUser.name}</h3>
                <button onClick={() => setPwdUser(null)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Password Baru</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Konfirmasi Password</label>
                  <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <button onClick={savePassword} className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white">Ubah Password</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
