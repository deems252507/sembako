import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { payCustomerDebt, paySupplierDebt } from "@/lib/pos/actions";
import { usePosStore } from "@/lib/pos/store";
import { cn, formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/_app/hutang")({ component: HutangPage });

function HutangPage() {
  const customers = usePosStore((s) => s.customers);
  const suppliers = usePosStore((s) => s.suppliers);
  const apply = usePosStore((s) => s.apply);
  const [tab, setTab] = useState<"piutang" | "hutang">("piutang");
  const [pay, setPay] = useState<{ type: "pelanggan" | "supplier"; id: string; name: string; sisa: number } | null>(null);
  const [amount, setAmount] = useState("");
  const piutang = customers.filter((c) => c.debtRemaining > 0);
  const hutang = suppliers.filter((s) => s.debt > 0);

  return (
    <>
      <PageHeader title="Hutang & Piutang" />
      <main className="space-y-4 p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="text-sm text-muted">Piutang pelanggan</p>
            <p className="font-display text-2xl text-warning tabular">{formatRupiah(customers.reduce((s, c) => s + c.debtRemaining, 0))}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-muted">Hutang supplier</p>
            <p className="font-display text-2xl text-danger tabular">{formatRupiah(suppliers.reduce((s, c) => s + c.debt, 0))}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 rounded-xl bg-surface p-1 ring-1 ring-border">
          {(["piutang", "hutang"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={cn("rounded-lg py-2 text-sm font-semibold capitalize", tab === t ? "bg-elevated shadow-sm" : "text-muted")}>
              {t}
            </button>
          ))}
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left text-muted">
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Sisa</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {(tab === "piutang" ? piutang : hutang).map((row) => {
                const sisa = "debtRemaining" in row ? row.debtRemaining : row.debt;
                return (
                  <tr key={row.id} className="border-b border-border/70">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 tabular">{formatRupiah(sisa)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="btn-primary py-1.5 text-xs"
                        onClick={() => setPay({ type: tab === "piutang" ? "pelanggan" : "supplier", id: row.id, name: row.name, sisa })}
                      >
                        Bayar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
      <Modal open={Boolean(pay)} onClose={() => setPay(null)} title={`Bayar ${pay?.name ?? ""}`}>
        <p className="mb-2 text-sm text-muted">Sisa {formatRupiah(pay?.sisa ?? 0)}</p>
        <input className="field" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Nominal" />
        <button
          type="button"
          className="btn-primary mt-4 w-full"
          onClick={async () => {
            if (!pay) return;
            const nominal = Number(amount);
            try {
              const snap =
                pay.type === "pelanggan"
                  ? await payCustomerDebt({ data: { id: pay.id, amount: nominal } })
                  : await paySupplierDebt({ data: { id: pay.id, amount: nominal } });
              apply(snap);
              setPay(null);
              setAmount("");
              toast.success("Pembayaran tercatat");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Gagal");
            }
          }}
        >
          Konfirmasi
        </button>
      </Modal>
    </>
  );
}
