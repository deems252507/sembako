"use client";
import Header from "@/components/Header";

const users = [
  { id: "1", name: "Admin", username: "admin", role: "Administrator", status: "Aktif" },
  { id: "2", name: "Kasir Pagi", username: "pagi", role: "Kasir", status: "Aktif" },
  { id: "3", name: "Kasir Siang", username: "siang", role: "Kasir", status: "Aktif" },
];

export default function PenggunaPage() {
  return (
    <>
      <Header title="Pengguna" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Daftar Pengguna</h2>
          <button className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
            + Tambah Pengguna
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
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className="badge badge-success">{u.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
