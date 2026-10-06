import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Printer, Search } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { MoneyInput } from "@/components/money-input";
import { payCustomerDebt, paySupplierDebt } from "@/lib/pos/actions";
import { usePosStore } from "@/lib/pos/store";
import type { Customer, Purchase, Sale } from "@/lib/pos/types";
import { formatDate, formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/_app/hutang")({ component: HutangPage });

type StatusFilter = "semua" | "belum" | "lunas";

function HutangPage() {
  const customers = usePosStore((s) => s.customers);
  const suppliers = usePosStore((s) => s.suppliers);
  const sales = usePosStore((s) => s.sales);
  const purchases = usePosStore((s) => s.purchases);
  const profile = usePosStore((s) => s.profile);
  const apply = usePosStore((s) => s.apply);

  const [tab, setTab] = useState<"piutang" | "hutang">("piutang");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [pay, setPay] = useState<{
    type: "pelanggan" | "supplier";
    id: string;
    name: string;
    sisa: number;
  } | null>(null);
  const [amount, setAmount] = useState(0);
  const [detailCust, setDetailCust] = useState<Customer | null>(null);
  const [detailSupplier, setDetailSupplier] = useState<{
    id: string;
    name: string;
    debt: number;
  } | null>(null);

  const totalPiutang = customers.reduce((s, c) => s + c.debtRemaining, 0);
  const totalHutang = suppliers.reduce((s, c) => s + c.debt, 0);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchQ =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || "").includes(search);
      if (!matchQ) return false;
      if (statusFilter === "belum") return c.debtRemaining > 0;
      if (statusFilter === "lunas") return c.debtRemaining <= 0;
      return true;
    });
  }, [customers, search, statusFilter]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchQ =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.phone || "").includes(search);
      if (!matchQ) return false;
      if (statusFilter === "belum") return s.debt > 0;
      if (statusFilter === "lunas") return s.debt <= 0;
      return true;
    });
  }, [suppliers, search, statusFilter]);

  const customerBonSales = (cust: Customer): Sale[] =>
    sales.filter(
      (t) =>
        t.isDebt &&
        (t.customerId === cust.id ||
          t.customerName.toLowerCase() === cust.name.toLowerCase()),
    );

  const supplierPurchases = (supplierId: string, name: string): Purchase[] =>
    purchases.filter(
      (p) =>
        p.status === "Hutang" &&
        (p.supplierId === supplierId ||
          p.supplierName.toLowerCase() === name.toLowerCase()),
    );

  const printBon = (sale: Sale) => {
    const win = window.open("", "_blank", "width=320,height=600");
    if (!win) {
      toast.error("Popup diblokir — izinkan popup untuk cetak");
      return;
    }
    const itemsHtml = sale.items
      .map(
        (item) =>
          `<div class="row"><span>${item.name} x${item.qty}</span><span>${formatRupiah(item.price * item.qty)}</span></div>`,
      )
      .join("");
    win.document.write(`
      <html><head><title>Bon ${sale.invoice}</title>
      <style>
        body{font-family:monospace;font-size:12px;width:280px;margin:0 auto;padding:12px}
        .center{text-align:center}.bold{font-weight:bold}
        .row{display:flex;justify-content:space-between;margin:2px 0}
        hr{border:none;border-top:1px dashed #333;margin:8px 0}
      </style></head><body>
      <div class="center bold" style="font-size:14px">${profile.storeName}</div>
      <div class="center" style="font-size:11px;color:#555">${profile.address || ""}</div>
      <div class="center bold" style="margin-top:8px;color:#b45309">* BON / PIUTANG *</div>
      <hr>
      <div>Invoice: ${sale.invoice}</div>
      <div>Tanggal: ${sale.date.slice(0, 16).replace("T", " ")}</div>
      <div>Kasir: ${sale.cashier}</div>
      <div>Pelanggan: ${sale.customerName || "Umum"}</div>
      <div>Status: BELUM LUNAS</div>
      <hr>
      ${itemsHtml}
      <hr>
      <div class="row bold"><span>Total Bon</span><span>${formatRupiah(sale.total)}</span></div>
      <hr>
      <div class="center" style="font-size:11px;color:#888;margin-top:8px">Harap dilunasi sesuai kesepakatan</div>
      <script>window.onload=function(){window.print()}</script>
      </body></html>
    `);
    win.document.close();
  };

  const handlePrintPiutang = () => {
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Popup diblokir — izinkan popup untuk cetak PDF");
      return;
    }

    const list =
      statusFilter === "lunas"
        ? customers.filter((c) => c.debtRemaining <= 0)
        : statusFilter === "belum"
          ? customers.filter((c) => c.debtRemaining > 0)
          : customers.filter((c) => c.debtRemaining > 0 || customerBonSales(c).length > 0);

    const filteredBySearch = search
      ? list.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.phone || "").includes(search),
        )
      : list;

    let bodyHtml = "";
    let no = 0;

    filteredBySearch.forEach((cust) => {
      const bons = customerBonSales(cust);
      no += 1;
      let invBlocks = "";

      if (bons.length === 0) {
        invBlocks = `<p class="note">Belum ada rincian transaksi bon di sistem. Sisa: ${formatRupiah(cust.debtRemaining)}</p>`;
      } else {
        bons.forEach((t) => {
          const itemsRows = t.items
            .map(
              (item, i) =>
                `<tr>
                  <td class="c">${i + 1}</td>
                  <td>${item.name}</td>
                  <td class="c">${item.qty}</td>
                  <td class="r">${formatRupiah(item.price)}</td>
                  <td class="r">${formatRupiah(item.price * item.qty)}</td>
                </tr>`,
            )
            .join("");
          invBlocks += `
          <div class="box">
            <div class="meta">
              <span><b>No. ${t.invoice}</b></span>
              <span>${t.date.slice(0, 10)}</span>
              <span>Kasir: ${t.cashier}</span>
              <span style="color:${cust.debtRemaining > 0 ? "#b91c1c" : "#15803d"};font-weight:700">${
                cust.debtRemaining > 0 ? "BELUM LUNAS" : "LUNAS"
              }</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width:36px">No</th>
                  <th>Nama Barang</th>
                  <th style="width:50px" class="c">Qty</th>
                  <th style="width:100px" class="r">Harga</th>
                  <th style="width:110px" class="r">Subtotal</th>
                </tr>
              </thead>
              <tbody>${itemsRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="r"><b>Total Bon</b></td>
                  <td class="r"><b>${formatRupiah(t.total)}</b></td>
                </tr>
              </tfoot>
            </table>
          </div>`;
        });
      }

      bodyHtml += `
      <section class="cust">
        <div class="cust-head">
          <div>
            <span class="badge">${no}</span>
            <strong>${cust.name}</strong>
            <span class="phone">${cust.phone || "-"}</span>
          </div>
          <div class="cust-sum">Sisa: <b>${formatRupiah(cust.debtRemaining)}</b> · ${
            cust.debtRemaining > 0 ? "Belum Lunas" : "Lunas"
          }</div>
        </div>
        ${invBlocks}
      </section>`;
    });

    if (!bodyHtml) bodyHtml = '<p class="empty">Tidak ada data sesuai filter.</p>';

    const grandTotal = filteredBySearch.reduce((s, c) => s + c.debtRemaining, 0);
    const tgl = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8"/>
<title>Laporan Piutang - ${profile.storeName}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Segoe UI", Tahoma, Arial, sans-serif; font-size: 11px; color: #1a1a1a; line-height: 1.45; }
  .header { border-bottom: 2px solid #14532d; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
  .header h1 { font-size: 16px; color: #14532d; font-weight: 700; }
  .header .addr { font-size: 10px; color: #555; margin-top: 3px; }
  .header .title-right { text-align: right; }
  .header .title-right .doc { font-size: 13px; font-weight: 700; color: #14532d; }
  .header .title-right .tgl { font-size: 10px; color: #666; margin-top: 2px; }
  .cust { margin-bottom: 18px; page-break-inside: avoid; }
  .cust-head { display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 8px 10px; margin-bottom: 8px; }
  .badge { display: inline-block; background: #14532d; color: #fff; font-size: 10px; font-weight: 700; width: 20px; height: 20px; line-height: 20px; text-align: center; border-radius: 50%; margin-right: 8px; }
  .phone { color: #666; margin-left: 8px; font-weight: 400; }
  .cust-sum { font-size: 11px; color: #166534; }
  .box { border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 8px; overflow: hidden; }
  .meta { display: flex; gap: 16px; flex-wrap: wrap; background: #f8fafc; padding: 6px 10px; font-size: 10px; color: #475569; border-bottom: 1px solid #e5e7eb; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f1f5f9; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; color: #475569; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: left; }
  td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
  tbody tr:last-child td { border-bottom: none; }
  tfoot td { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 6px 8px; font-size: 11px; }
  .c { text-align: center; } .r { text-align: right; }
  .note { color: #94a3b8; font-size: 10px; padding: 6px 0; font-style: italic; }
  .empty { text-align: center; color: #94a3b8; padding: 32px; }
  .footer-total { margin-top: 20px; border: 2px solid #14532d; border-radius: 4px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; }
  .footer-total .label { font-size: 12px; font-weight: 600; color: #14532d; }
  .footer-total .amount { font-size: 16px; font-weight: 700; color: #14532d; }
</style></head><body>
  <div class="header">
    <div>
      <h1>${profile.storeName}</h1>
      <div class="addr">${profile.address || ""} · ${profile.phone || ""}</div>
    </div>
    <div class="title-right">
      <div class="doc">Laporan Piutang Pelanggan</div>
      <div class="tgl">${tgl}</div>
      <div class="tgl">Filter: ${
        statusFilter === "belum" ? "Belum Lunas" : statusFilter === "lunas" ? "Lunas" : "Semua"
      }${search ? " · Cari: " + search : ""}</div>
    </div>
  </div>
  ${bodyHtml}
  <div class="footer-total">
    <span class="label">Total Sisa Piutang</span>
    <span class="amount">${formatRupiah(grandTotal)}</span>
  </div>
  <script>window.onload=function(){window.print()}</script>
</body></html>`);
    win.document.close();
  };

  return (
    <>
      <PageHeader title="Hutang & Piutang" />
      <main className="space-y-4 p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card p-5">
            <p className="text-sm text-muted">Total Piutang Pelanggan</p>
            <p className="text-2xl font-bold tabular text-amber-600">{formatRupiah(totalPiutang)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-muted">Total Hutang Supplier</p>
            <p className="text-2xl font-bold tabular text-danger">{formatRupiah(totalHutang)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={
              "rounded-full px-4 py-1.5 text-sm font-medium " +
              (tab === "piutang" ? "bg-accent text-accent-fg" : "bg-bg text-muted")
            }
            onClick={() => {
              setTab("piutang");
              setStatusFilter("semua");
              setSearch("");
            }}
          >
            Piutang Pelanggan
          </button>
          <button
            type="button"
            className={
              "rounded-full px-4 py-1.5 text-sm font-medium " +
              (tab === "hutang" ? "bg-accent text-accent-fg" : "bg-bg text-muted")
            }
            onClick={() => {
              setTab("hutang");
              setStatusFilter("semua");
              setSearch("");
            }}
          >
            Hutang Supplier
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="field w-full pl-10"
              placeholder={tab === "piutang" ? "Cari nama / no HP pelanggan..." : "Cari supplier..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["semua", "belum", "lunas"] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={
                  "rounded-full px-3 py-1.5 text-xs font-medium " +
                  (statusFilter === f ? "bg-accent text-accent-fg" : "btn-ghost")
                }
                onClick={() => setStatusFilter(f)}
              >
                {f === "semua" ? "Semua" : f === "belum" ? "Belum Lunas" : "Lunas"}
              </button>
            ))}
            {tab === "piutang" ? (
              <button type="button" className="btn-ghost" onClick={handlePrintPiutang}>
                <Printer className="h-4 w-4" /> Cetak PDF
              </button>
            ) : null}
          </div>
        </div>

        {tab === "piutang" ? (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg text-left text-muted">
                    <th className="px-4 py-3 font-medium">Nama</th>
                    <th className="px-4 py-3 font-medium">No HP</th>
                    <th className="px-4 py-3 font-medium">Total Belanja</th>
                    <th className="px-4 py-3 font-medium">Sisa Hutang</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr key={c.id} className="border-b border-border/70">
                        <td className="px-4 py-3 font-medium">{c.name}</td>
                        <td className="px-4 py-3">{c.phone || "-"}</td>
                        <td className="px-4 py-3 tabular">{formatRupiah(c.totalSpent)}</td>
                        <td
                          className={
                            "px-4 py-3 tabular " +
                            (c.debtRemaining > 0 ? "font-medium text-danger" : "")
                          }
                        >
                          {formatRupiah(c.debtRemaining)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              "badge " + (c.debtRemaining > 0 ? "badge-warning" : "badge-success")
                            }
                          >
                            {c.debtRemaining > 0 ? "Belum Lunas" : "Lunas"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              className="rounded-lg p-1.5 text-muted hover:bg-bg"
                              title="Detail"
                              onClick={() => setDetailCust(c)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {c.debtRemaining > 0 ? (
                              <button
                                type="button"
                                className="btn-primary py-1 px-2 text-xs"
                                onClick={() => {
                                  setPay({
                                    type: "pelanggan",
                                    id: c.id,
                                    name: c.name,
                                    sisa: c.debtRemaining,
                                  });
                                  setAmount(c.debtRemaining);
                                }}
                              >
                                Bayar
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg text-left text-muted">
                    <th className="px-4 py-3 font-medium">Supplier</th>
                    <th className="px-4 py-3 font-medium">No HP</th>
                    <th className="px-4 py-3 font-medium">Total Beli</th>
                    <th className="px-4 py-3 font-medium">Sisa Hutang</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((s) => (
                      <tr key={s.id} className="border-b border-border/70">
                        <td className="px-4 py-3 font-medium">{s.name}</td>
                        <td className="px-4 py-3">{s.phone || "-"}</td>
                        <td className="px-4 py-3 tabular">{formatRupiah(s.totalPurchase)}</td>
                        <td
                          className={
                            "px-4 py-3 tabular " + (s.debt > 0 ? "font-medium text-danger" : "")
                          }
                        >
                          {formatRupiah(s.debt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={"badge " + (s.debt > 0 ? "badge-warning" : "badge-success")}>
                            {s.debt > 0 ? "Belum Lunas" : "Lunas"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              className="rounded-lg p-1.5 text-muted hover:bg-bg"
                              title="Detail"
                              onClick={() =>
                                setDetailSupplier({ id: s.id, name: s.name, debt: s.debt })
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {s.debt > 0 ? (
                              <button
                                type="button"
                                className="btn-primary py-1 px-2 text-xs"
                                onClick={() => {
                                  setPay({
                                    type: "supplier",
                                    id: s.id,
                                    name: s.name,
                                    sisa: s.debt,
                                  });
                                  setAmount(s.debt);
                                }}
                              >
                                Bayar
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Detail pelanggan + rincian bon */}
      <Modal
        open={Boolean(detailCust)}
        onClose={() => setDetailCust(null)}
        title={detailCust ? `Detail ${detailCust.name}` : "Detail"}
        wide
      >
        {detailCust ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted">No HP</p>
                <p className="font-medium">{detailCust.phone || "-"}</p>
              </div>
              <div>
                <p className="text-muted">Total Belanja</p>
                <p className="font-medium tabular">{formatRupiah(detailCust.totalSpent)}</p>
              </div>
              <div>
                <p className="text-muted">Sisa Hutang</p>
                <p className="font-medium tabular text-danger">
                  {formatRupiah(detailCust.debtRemaining)}
                </p>
              </div>
              <div>
                <p className="text-muted">Status</p>
                <span
                  className={
                    "badge " +
                    (detailCust.debtRemaining > 0 ? "badge-warning" : "badge-success")
                  }
                >
                  {detailCust.debtRemaining > 0 ? "Belum Lunas" : "Lunas"}
                </span>
              </div>
            </div>
            <hr className="border-border" />
            <h4 className="font-semibold">Rincian Bon / Pembelian</h4>
            <div className="max-h-72 space-y-3 overflow-y-auto">
              {customerBonSales(detailCust).length === 0 ? (
                <p className="text-sm text-muted">Belum ada rincian transaksi bon di sistem.</p>
              ) : (
                customerBonSales(detailCust).map((t) => (
                  <div key={t.id} className="rounded-xl border border-border p-3 text-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-medium text-green-600">{t.invoice}</span>
                      <span className="text-xs text-muted">{formatDate(t.date)}</span>
                    </div>
                    {t.items.map((item) => (
                      <div key={item.productId} className="flex justify-between py-0.5 text-muted">
                        <span>
                          {item.name} x{item.qty}
                        </span>
                        <span className="tabular">{formatRupiah(item.price * item.qty)}</span>
                      </div>
                    ))}
                    <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-bold">
                      <span>Total Bon</span>
                      <span className="tabular text-danger">{formatRupiah(t.total)}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-ghost mt-2 w-full text-xs"
                      onClick={() => printBon(t)}
                    >
                      <Printer className="h-3.5 w-3.5" /> Cetak Bon
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              {detailCust.debtRemaining > 0 ? (
                <button
                  type="button"
                  className="btn-primary flex-1"
                  onClick={() => {
                    setPay({
                      type: "pelanggan",
                      id: detailCust.id,
                      name: detailCust.name,
                      sisa: detailCust.debtRemaining,
                    });
                    setAmount(detailCust.debtRemaining);
                    setDetailCust(null);
                  }}
                >
                  Bayar Hutang
                </button>
              ) : null}
              <button type="button" className="btn-ghost flex-1" onClick={() => setDetailCust(null)}>
                Tutup
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Detail supplier + rincian pembelian */}
      <Modal
        open={Boolean(detailSupplier)}
        onClose={() => setDetailSupplier(null)}
        title={detailSupplier ? `Detail ${detailSupplier.name}` : "Detail"}
        wide
      >
        {detailSupplier ? (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Sisa Hutang</span>
              <span className="font-medium tabular text-danger">
                {formatRupiah(detailSupplier.debt)}
              </span>
            </div>
            <hr className="border-border" />
            <h4 className="font-semibold">Rincian Pembelian (Hutang)</h4>
            <div className="max-h-72 space-y-3 overflow-y-auto">
              {supplierPurchases(detailSupplier.id, detailSupplier.name).length === 0 ? (
                <p className="text-sm text-muted">Belum ada rincian pembelian hutang.</p>
              ) : (
                supplierPurchases(detailSupplier.id, detailSupplier.name).map((p) => (
                  <div key={p.id} className="rounded-xl border border-border p-3 text-sm">
                    <div className="mb-2 flex justify-between">
                      <span className="font-medium">{formatDate(p.date)}</span>
                      <span className="badge badge-warning">{p.status}</span>
                    </div>
                    {p.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-0.5 text-muted">
                        <span>
                          {item.name} x{item.qty}
                        </span>
                        <span className="tabular">{formatRupiah(item.price * item.qty)}</span>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold">
                      <span>Total</span>
                      <span className="tabular text-danger">{formatRupiah(p.total)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              {detailSupplier.debt > 0 ? (
                <button
                  type="button"
                  className="btn-primary flex-1"
                  onClick={() => {
                    setPay({
                      type: "supplier",
                      id: detailSupplier.id,
                      name: detailSupplier.name,
                      sisa: detailSupplier.debt,
                    });
                    setAmount(detailSupplier.debt);
                    setDetailSupplier(null);
                  }}
                >
                  Bayar Hutang
                </button>
              ) : null}
              <button
                type="button"
                className="btn-ghost flex-1"
                onClick={() => setDetailSupplier(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={Boolean(pay)} onClose={() => setPay(null)} title={`Bayar ${pay?.name ?? ""}`}>
        <p className="mb-2 text-sm text-muted">Sisa {formatRupiah(pay?.sisa ?? 0)}</p>
        <MoneyInput value={amount} onChange={setAmount} placeholder="Nominal" />
        <button
          type="button"
          className="btn-primary mt-4 w-full"
          onClick={async () => {
            if (!pay) return;
            if (!amount || amount <= 0) {
              toast.error("Masukkan nominal");
              return;
            }
            if (amount > pay.sisa) {
              toast.error("Nominal melebihi sisa hutang");
              return;
            }
            try {
              const snap =
                pay.type === "pelanggan"
                  ? await payCustomerDebt({ data: { id: pay.id, amount } })
                  : await paySupplierDebt({ data: { id: pay.id, amount } });
              apply(snap);
              setPay(null);
              setAmount(0);
              toast.success("Pembayaran tercatat");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Gagal bayar");
            }
          }}
        >
          Konfirmasi
        </button>
      </Modal>
    </>
  );
}
