import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { MoneyInput } from "@/components/money-input";
import { addCashEntry, deleteCashEntry } from "@/lib/pos/actions";
import { usePosStore } from "@/lib/pos/store";
import { formatDate, formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/_app/keuangan")({ component: KeuanganPage });

function KeuanganPage() {
  const profile = usePosStore((s) => s.profile);
  const entries = usePosStore((s) => s.cashEntries);
  const sales = usePosStore((s) => s.sales);
  const apply = usePosStore((s) => s.apply);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"masuk" | "keluar">("masuk");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState(0);
  const [metode, setMetode] = useState<"tunai" | "qris" | "transfer">("tunai");

  const masuk = entries.filter((e) => e.kind === "masuk").reduce((s, e) => s + e.amount, 0);
  const keluar = entries.filter((e) => e.kind === "keluar").reduce((s, e) => s + e.amount, 0);

  const { cashSales, qrisSales, tfSales } = useMemo(() => {
    let cash = 0;
    let qris = 0;
    let tf = 0;
    for (const t of sales) {
      if (t.isDebt || t.status === "batal") continue;
      if (t.paymentMethod === "tunai") cash += t.total;
      else if (t.paymentMethod === "qris") qris += t.total;
      else if (t.paymentMethod === "transfer") tf += t.total;
    }
    return { cashSales: cash, qrisSales: qris, tfSales: tf };
  }, [sales]);

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = entries
      .map(
        (t) =>
          `<tr>
            <td>${t.date.slice(0, 10)}</td>
            <td>${t.note}</td>
            <td>${t.kind === "masuk" ? "Masuk" : "Keluar"}</td>
            <td style="text-align:right;color:${t.kind === "masuk" ? "green" : "red"}">${
              t.kind === "masuk" ? "+" : "-"
            }${formatRupiah(t.amount)}</td>
          </tr>`,
      )
      .join("");
    win.document.write(`
      <html><head><title>Laporan Keuangan - ${profile.storeName}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;font-size:13px}
        h1{margin:0;font-size:18px} .sub{color:#555;margin:4px 0 16px;font-size:13px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#f5f5f5}
        .cards{display:flex;gap:16px;margin:16px 0;flex-wrap:wrap}
        .card{border:1px solid #ddd;border-radius:8px;padding:12px;flex:1;min-width:140px}
        .card b{display:block;font-size:16px;margin-top:4px}
      </style></head><body>
      <h1>${profile.storeName}</h1>
      <p class="sub">Laporan Keuangan — ${new Date().toLocaleDateString("id-ID")}<br/>${profile.address || ""} | ${profile.phone || ""}</p>
      <div class="cards">
        <div class="card">Saldo Kas<b style="color:green">${formatRupiah(profile.cashBalance)}</b></div>
        <div class="card">Kas Masuk<b style="color:#2563eb">${formatRupiah(masuk)}</b></div>
        <div class="card">Kas Keluar<b style="color:red">${formatRupiah(keluar)}</b></div>
      </div>
      <div class="cards">
        <div class="card">Penjualan Tunai (Cash)<b>${formatRupiah(cashSales)}</b></div>
        <div class="card">QRIS<b>${formatRupiah(qrisSales)}</b></div>
        <div class="card">Transfer (TF)<b>${formatRupiah(tfSales)}</b></div>
      </div>
      <table>
        <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Jenis</th><th>Jumlah</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4" style="text-align:center">Belum ada mutasi kas</td></tr>'}</tbody>
      </table>
      <script>window.onload=function(){window.print()}</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <>
      <PageHeader title="Keuangan" />
      <main className="space-y-4 p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-sm text-muted">Saldo Kas</p>
            <p className="text-2xl font-semibold tabular text-green-600">{formatRupiah(profile.cashBalance)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-muted">Total Kas Masuk</p>
            <p className="text-2xl font-semibold text-success tabular">{formatRupiah(masuk)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-muted">Total Kas Keluar</p>
            <p className="text-2xl font-semibold text-danger tabular">{formatRupiah(keluar)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card p-4">
            <p className="text-xs text-muted">Penjualan Tunai (Cash)</p>
            <p className="text-lg font-bold tabular">{formatRupiah(cashSales)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-muted">QRIS</p>
            <p className="text-lg font-bold tabular">{formatRupiah(qrisSales)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-muted">Transfer (TF)</p>
            <p className="text-lg font-bold tabular">{formatRupiah(tfSales)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Mutasi kas</h2>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Cetak PDF
            </button>
            <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
              Catat kas
            </button>
          </div>
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
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    Belum ada mutasi kas
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} className="border-b border-border/70">
                    <td className="px-4 py-3">{formatDate(e.date)}</td>
                    <td className="px-4 py-3">{e.note}</td>
                    <td
                      className={
                        "px-4 py-3 font-medium tabular " +
                        (e.kind === "masuk" ? "text-success" : "text-danger")
                      }
                    >
                      {e.kind === "masuk" ? "+" : "-"}
                      {formatRupiah(e.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="p-1.5 text-danger"
                        onClick={async () => {
                          if (!confirm("Hapus mutasi ini?")) return;
                          apply(await deleteCashEntry({ data: { id: e.id } }));
                          toast.success("Dihapus");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <Modal open={open} onClose={() => setOpen(false)} title="Catat kas">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={kind === "masuk" ? "btn-primary" : "btn-ghost"}
            onClick={() => setKind("masuk")}
          >
            Kas Masuk
          </button>
          <button
            type="button"
            className={kind === "keluar" ? "btn-primary" : "btn-ghost"}
            onClick={() => setKind("keluar")}
          >
            Kas Keluar
          </button>
        </div>
        <div className="mb-3 grid grid-cols-3 gap-2">
          {(["tunai", "qris", "transfer"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={
                "rounded-xl py-2 text-xs font-semibold capitalize " +
                (metode === m ? "border-2 border-accent bg-accent-soft" : "btn-ghost")
              }
              onClick={() => setMetode(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <input
          className="field mb-3"
          placeholder="Keterangan"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <MoneyInput value={amount} onChange={setAmount} placeholder="Jumlah" />
        <button
          type="button"
          className="btn-primary mt-4 w-full"
          onClick={async () => {
            if (!note.trim() || amount <= 0) {
              toast.error("Lengkapi data");
              return;
            }
            const ket = note.trim() + (metode !== "tunai" ? ` (${metode.toUpperCase()})` : "");
            apply(await addCashEntry({ data: { kind, note: ket, amount } }));
            setOpen(false);
            setNote("");
            setAmount(0);
            setMetode("tunai");
            toast.success("Tercatat");
          }}
        >
          Simpan
        </button>
      </Modal>
    </>
  );
}
