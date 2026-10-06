import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Printer, Search, Trash2 } from "lucide-react";
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
          (t.cashier || "").toLowerCase().includes(q.toLowerCase()) ||
          t.customerName.toLowerCase().includes(q.toLowerCase());
        const matchD = !date || t.date.slice(0, 10) === date;
        return matchQ && matchD;
      }),
    [sales, q, date],
  );

  const omzet = filtered.reduce((s, t) => s + t.total, 0);

  const handlePrintStruk = (trx: Sale) => {
    const win = window.open("", "_blank", "width=320,height=600");
    if (!win) return;
    const itemsHtml = trx.items
      .map(
        (item) =>
          `<div class="row"><span>${item.name} x${item.qty}</span><span>${formatRupiah(item.price * item.qty)}</span></div>`,
      )
      .join("");
    win.document.write(`
      <html><head><title>Struk ${trx.invoice}</title>
      <style>
        body{font-family:monospace;font-size:12px;width:280px;margin:0 auto;padding:12px}
        .center{text-align:center}.bold{font-weight:bold}
        .row{display:flex;justify-content:space-between;margin:2px 0}
        hr{border:none;border-top:1px dashed #333;margin:8px 0}
      </style></head><body>
      <div class="center bold" style="font-size:14px">${profile.storeName}</div>
      <div class="center" style="font-size:11px;color:#555">${profile.address || ""}</div>
      <div class="center" style="font-size:11px;color:#555">${profile.phone || ""}</div>
      <hr>
      <div>Invoice: ${trx.invoice}</div>
      <div>Tanggal: ${trx.date.slice(0, 16).replace("T", " ")}</div>
      <div>Kasir: ${trx.cashier}</div>
      <div>Pelanggan: ${trx.customerName || "Umum"}</div>
      <div>Metode: ${trx.isDebt ? "BON / HUTANG" : trx.paymentMethod}</div>
      <div>Status: ${trx.isDebt ? "BELUM LUNAS" : "LUNAS"}</div>
      <hr>
      ${itemsHtml}
      <hr>
      <div class="row bold"><span>Total</span><span>${formatRupiah(trx.total)}</span></div>
      ${
        !trx.isDebt && trx.paymentMethod === "tunai"
          ? `
        <div class="row"><span>Bayar</span><span>${formatRupiah(trx.amountPaid)}</span></div>
        <div class="row"><span>Kembali</span><span>${formatRupiah(trx.change)}</span></div>
      `
          : ""
      }
      ${trx.isDebt ? `<div class="center bold" style="color:#b45309;margin-top:6px">* BELUM LUNAS *</div>` : ""}
      <hr>
      <div class="center" style="font-size:11px;color:#888;margin-top:8px">${
        profile.footerReceipt && !profile.footerReceipt.includes("Makmur")
          ? profile.footerReceipt
          : "Terima kasih telah berbelanja di " + profile.storeName + "!"
      }</div>
      <script>window.onload=function(){window.print()}</script>
      </body></html>
    `);
    win.document.close();
  };

  const handleDelete = async (t: Sale) => {
    if (!confirm("Hapus transaksi " + t.invoice + "?")) return;
    apply(await deleteSale({ data: { id: t.id } }));
    toast.success("Dihapus");
    if (detail?.id === t.id) setDetail(null);
  };

  return (
    <>
      <PageHeader title="Laporan & Riwayat" />
      <main className="space-y-4 p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-sm text-muted">Total Omzet (filter)</p>
            <p className="font-display text-2xl tabular text-green-600">{formatRupiah(omzet)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-muted">Jumlah Transaksi</p>
            <p className="font-display text-2xl tabular">{filtered.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-muted">Semua Transaksi</p>
            <p className="font-display text-2xl tabular">{sales.length}</p>
          </div>
        </div>

        <div className="card flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="field w-full pl-10"
              placeholder="Cari invoice, kasir, pelanggan..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <input
            className="field sm:w-48"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {date ? (
            <button type="button" className="btn-ghost" onClick={() => setDate("")}>
              Reset Tanggal
            </button>
          ) : null}
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg text-left text-muted">
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Pelanggan</th>
                  <th className="px-4 py-3 font-medium">Kasir</th>
                  <th className="px-4 py-3 font-medium">Metode</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-muted">
                      Belum ada transaksi. Lakukan penjualan di Kasir.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} className="border-b border-border/70">
                      <td className="px-4 py-3 font-mono text-xs text-green-600">{t.invoice}</td>
                      <td className="px-4 py-3">{t.date.slice(0, 10)}</td>
                      <td className="px-4 py-3">{t.customerName || "Umum"}</td>
                      <td className="px-4 py-3">{t.cashier}</td>
                      <td className="px-4 py-3 capitalize">
                        {t.isDebt ? (
                          <span className="badge badge-warning">Bon</span>
                        ) : (
                          t.paymentMethod
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {t.isDebt ? (
                          <span className="badge badge-danger">Belum Lunas</span>
                        ) : (
                          <span className="badge badge-success">Lunas</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium tabular">{formatRupiah(t.total)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-muted hover:bg-bg"
                            title="Detail"
                            onClick={() => setDetail(t)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-muted hover:bg-bg"
                            title="Cetak"
                            onClick={() => handlePrintStruk(t)}
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-1.5 text-danger hover:bg-red-50"
                            title="Hapus"
                            onClick={() => handleDelete(t)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title={detail ? `Detail ${detail.invoice}` : "Detail"}>
        {detail ? (
          <div className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Invoice</span>
                <span className="font-medium text-green-600">{detail.invoice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tanggal</span>
                <span>{formatDateTime(detail.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Kasir</span>
                <span>{detail.cashier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Pelanggan</span>
                <span>{detail.customerName || "Umum"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Metode</span>
                <span className="capitalize">{detail.isDebt ? "Bon / Hutang" : detail.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <span className={"badge " + (detail.isDebt ? "badge-danger" : "badge-success")}>
                  {detail.isDebt ? "Belum Lunas" : "Lunas"}
                </span>
              </div>
            </div>
            <hr className="border-border" />
            <div className="space-y-2 text-sm">
              {detail.items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span>
                    {item.name} x{item.qty}
                  </span>
                  <span className="font-medium tabular">{formatRupiah(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <hr className="border-border" />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="tabular text-green-600">{formatRupiah(detail.total)}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="btn-ghost flex-1" onClick={() => handlePrintStruk(detail)}>
                <Printer className="h-4 w-4" /> Cetak Ulang
              </button>
              <button type="button" className="btn flex-1" onClick={() => setDetail(null)}>
                Tutup
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
