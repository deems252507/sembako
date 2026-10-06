import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { addCashEntry, deleteCashEntry } from "@/lib/pos/actions";
import { usePosStore } from "@/lib/pos/store";
import { MoneyInput } from "@/components/money-input";
import { formatDate, formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/_app/keuangan")({ component: KeuanganPage });

function KeuanganPage() {
  const profile = usePosStore((s) => s.profile);
  const entries = usePosStore((s) => s.cashEntries);
  const apply = usePosStore((s) => s.apply);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"masuk" | "keluar">("masuk");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState(0);
  const masuk = entries.filter((e) => e.kind === "masuk").reduce((s, e) => s + e.amount, 0);
  const keluar = entries.filter((e) => e.kind === "keluar").reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <PageHeader title="Keuangan" />
      <main className="space-y-4 p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card p-5"><p className="text-sm text-muted">Saldo kas</p><p className="text-2xl font-semibold tabular">{formatRupiah(profile.cashBalance)}</p></div>
          <div className="card p-5"><p className="text-sm text-muted">Masuk</p><p className="text-2xl font-semibold text-success tabular">{formatRupiah(masuk)}</p></div>
          <div className="card p-5"><p className="text-sm text-muted">Keluar</p><p className="text-2xl font-semibold text-danger tabular">{formatRupiah(keluar)}</p></div>
        </div>
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold">Mutasi kas</h2>
          <button type="button" className="btn-primary" onClick={() => setOpen(true)}>Catat kas</button>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left text-muted">
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Keterangan</th>
                <th className="px-4 py-3 font-medium">Jumlah</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-border/70">
                  <td className="px-4 py-3">{formatDate(e.date)}</td>
                  <td className="px-4 py-3">{e.note}</td>
                  <td className={`px-4 py-3 tabular ${e.kind === "masuk" ? "text-success" : "text-danger"}`}>
                    {e.kind === "masuk" ? "+" : "-"}{formatRupiah(e.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" className="p-2 text-danger" onClick={async () => { apply(await deleteCashEntry({ data: { id: e.id } })); }}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Modal open={open} onClose={() => setOpen(false)} title="Catat kas">
        <select className="field" value={kind} onChange={(e) => setKind(e.target.value as "masuk" | "keluar")}>
          <option value="masuk">Masuk</option>
          <option value="keluar">Keluar</option>
        </select>
        <input className="field mt-2" placeholder="Keterangan" value={note} onChange={(e) => setNote(e.target.value)} />
        <MoneyInput className="mt-2" placeholder="Nominal" value={amount} onChange={setAmount} />
        <button type="button" className="btn-primary mt-4 w-full" onClick={async () => {
          if (!note || !amount) return toast.error("Lengkapi data");
          apply(await addCashEntry({ data: { note, kind, amount } }));
          setOpen(false); setNote(""); setAmount(0);
        }}>Simpan</button>
      </Modal>
    </>
  );
}
