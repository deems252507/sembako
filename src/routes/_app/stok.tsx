import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { adjustStock } from "@/lib/pos/actions";
import { usePosStore } from "@/lib/pos/store";
import { formatDateTime } from "@/lib/utils";

export const Route = createFileRoute("/_app/stok")({ component: StokPage });

function StokPage() {
  const products = usePosStore((s) => s.products);
  const logs = usePosStore((s) => s.stockLogs);
  const apply = usePosStore((s) => s.apply);
  const [target, setTarget] = useState<{ id: string; name: string; stock: number } | null>(null);
  const [stock, setStock] = useState("");
  const [note, setNote] = useState("");
  const low = products.filter((p) => p.stock <= p.minStock);
  const empty = products.filter((p) => p.stock <= 0);

  return (
    <>
      <PageHeader title="Stok" subtitle="Koreksi stok fisik" />
      <main className="page-main space-y-4 p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card-stat">
            <p className="text-xs font-medium text-muted">Total Produk</p>
            <p className="mt-1 text-xl font-semibold tabular">{products.length}</p>
          </div>
          <div className="card-stat">
            <p className="text-xs font-medium text-muted">Stok Menipis</p>
            <p className="mt-1 text-xl font-semibold tabular text-warning">{low.length}</p>
          </div>
          <div className="card-stat">
            <p className="text-xs font-medium text-muted">Stok Habis</p>
            <p className="mt-1 text-xl font-semibold tabular text-danger">{empty.length}</p>
          </div>
        </div>
        {low.length > 0 ? (
          <div className="card border-warning/30 bg-warning/8 p-4">
            <div className="mb-2 flex items-center gap-2 font-medium text-warning">
              <AlertTriangle className="h-4 w-4" /> Stok menipis
            </div>
            <p className="text-sm text-muted">{low.map((p) => p.name).join(", ")}</p>
          </div>
        ) : null}
        <div className="table-wrap">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left text-muted">
                <th className="px-4 py-3 font-medium">Produk</th>
                <th className="px-4 py-3 font-medium">Stok</th>
                <th className="px-4 py-3 font-medium">Min</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border/70">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 tabular">{p.stock}</td>
                  <td className="px-4 py-3 tabular text-muted">{p.minStock}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="btn-ghost py-1.5 text-xs"
                      onClick={() => {
                        setTarget({ id: p.id, name: p.name, stock: p.stock });
                        setStock(String(p.stock));
                        setNote("");
                      }}
                    >
                      Sesuaikan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card p-4">
          <h3 className="mb-3 font-semibold">Riwayat koreksi</h3>
          <div className="space-y-2 text-sm">
            {logs.length === 0 ? <p className="text-muted">Belum ada koreksi.</p> : logs.map((l) => (
              <div key={l.id} className="flex justify-between gap-3">
                <span>{l.productName}: {l.qtyBefore} → {l.qtyAfter}</span>
                <span className="text-subtle">{formatDateTime(l.date)}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Modal open={Boolean(target)} onClose={() => setTarget(null)} title="Sesuaikan stok">
        <p className="mb-3 text-sm text-muted">{target?.name} — stok sekarang {target?.stock}</p>
        <input className="field" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
        <input className="field mt-2" placeholder="Catatan" value={note} onChange={(e) => setNote(e.target.value)} />
        <button
          type="button"
          className="btn-primary mt-4 w-full"
          onClick={async () => {
            if (!target) return;
            apply(await adjustStock({ data: { id: target.id, stock: Number(stock), note: note || "Penyesuaian stok" } }));
            setTarget(null);
            toast.success("Stok diperbarui");
          }}
        >
          Simpan
        </button>
      </Modal>
    </>
  );
}
