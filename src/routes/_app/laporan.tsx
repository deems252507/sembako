import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { deleteSale } from "@/lib/pos/actions";
import { usePosStore } from "@/lib/pos/store";
import type { Sale } from "@/lib/pos/types";
import { formatDateTime, formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/_app/laporan")({ component: LaporanPage });

function LaporanPage() {
  const sales = usePosStore((s) => s.sales);
  const profile = usePosStore((s) => s.profile);
  const apply = usePosStore((s) => s.apply);
  const [q, setQ] = useState("");
  const [date, setDate] = useState("");
  const [detail, setDetail] = useState<Sale | null>(null);
  const filtered = useMemo(
    () =>
      sales.filter((t) => {
        const matchQ =
          t.invoice.toLowerCase().includes(q.toLowerCase()) ||
          t.customerName.toLowerCase().includes(q.toLowerCase());
        const matchD = !date || t.date.slice(0, 10) === date;
        return matchQ && matchD;
      }),
    [sales, q, date],
  );
  const omzet = filtered.reduce((s, t) => s + t.total, 0);

  return (
    <>
      <PageHeader title="Laporan" />
      <main className="space-y-4 p-4 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input className="field flex-1" placeholder="Cari invoice / pelanggan" value={q} onChange={(e) => setQ(e.target.value)} />
          <input className="field sm:w-48" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="card p-4">
          <p className="text-sm text-muted">Omzet tampilan ini</p>
          <p className="font-display text-2xl tabular">{formatRupiah(omzet)}</p>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left text-muted">
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Waktu</th>
                <th className="px-4 py-3 font-medium">Pelanggan</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border/70">
                  <td className="px-4 py-3 font-mono text-xs">{t.invoice}</td>
                  <td className="px-4 py-3">{formatDateTime(t.date)}</td>
                  <td className="px-4 py-3">{t.customerName}{t.isDebt ? " · BON" : ""}</td>
                  <td className="px-4 py-3 tabular">{formatRupiah(t.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button type="button" className="p-2" onClick={() => setDetail(t)}><Eye className="h-4 w-4" /></button>
                      <button type="button" className="p-2 text-danger" onClick={async () => { apply(await deleteSale({ data: { id: t.id } })); toast.success("Dihapus"); }}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.invoice ?? "Struk"}>
        {detail ? (
          <div className="space-y-2 font-mono text-xs">
            <p className="text-center text-sm font-bold">{profile.storeName}</p>
            {detail.items.map((i) => (
              <div key={i.productId} className="flex justify-between">
                <span>{i.name} x{i.qty}</span>
                <span>{formatRupiah(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatRupiah(detail.total)}</span>
            </div>
            <button type="button" className="btn-ghost mt-3 w-full" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Cetak
            </button>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
