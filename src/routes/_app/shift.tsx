import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { closeShift, openShift } from "@/lib/pos/actions";
import { usePosStore } from "@/lib/pos/store";
import { MoneyInput } from "@/components/money-input";
import { formatDateTime, formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/_app/shift")({ component: ShiftPage });

function ShiftPage() {
  const shifts = usePosStore((s) => s.shifts);
  const sales = usePosStore((s) => s.sales);
  const profile = usePosStore((s) => s.profile);
  const apply = usePosStore((s) => s.apply);
  const current = shifts.find((s) => s.status === "open") ?? null;
  const [initial, setInitial] = useState(0);
  const [actual, setActual] = useState(0);
  const cashSales = sales.filter((t) => t.paymentMethod === "tunai" && !t.isDebt).reduce((s, t) => s + t.total, 0);

  return (
    <>
      <PageHeader title="Shift kasir" />
      <main className="space-y-4 p-4 lg:p-6">
        {current ? (
          <div className="card space-y-4 p-6">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-success" />
              <h2 className="text-lg font-semibold">Shift aktif</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><p className="text-sm text-muted">Dibuka</p><p>{formatDateTime(current.openedAt)}</p></div>
              <div><p className="text-sm text-muted">Modal awal</p><p className="tabular">{formatRupiah(current.initialCash)}</p></div>
              <div><p className="text-sm text-muted">Penjualan tunai</p><p className="tabular text-success">{formatRupiah(cashSales)}</p></div>
              <div><p className="text-sm text-muted">Kas saat ini</p><p className="tabular">{formatRupiah(profile.cashBalance)}</p></div>
            </div>
            <MoneyInput className="max-w-xs" placeholder="Uang fisik di laci" value={actual} onChange={setActual} />
            <button
              type="button"
              className="btn-primary bg-danger"
              onClick={async () => {
                apply(await closeShift({ data: { id: current.id, actualCash: actual || profile.cashBalance } }));
                toast.success("Shift ditutup");
              }}
            >
              Tutup shift
            </button>
          </div>
        ) : (
          <div className="card space-y-4 p-6">
            <h2 className="text-lg font-semibold">Buka shift</h2>
            <MoneyInput className="max-w-xs" value={initial} onChange={setInitial} />
            <button
              type="button"
              className="btn-primary"
              onClick={async () => {
                apply(await openShift({ data: { initialCash: initial || 0 } }));
                toast.success("Shift dibuka");
              }}
            >
              Buka shift
            </button>
          </div>
        )}
      </main>
    </>
  );
}
