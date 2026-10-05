"use client";
import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";
import { X, Eye, Printer, Search } from "lucide-react";

export default function LaporanPage() {
  const { transactions, storeSettings } = useStore();
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [detail, setDetail] = useState<any>(null);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.invoice.toLowerCase().includes(search.toLowerCase()) ||
        (t.cashier || "").toLowerCase().includes(search.toLowerCase()) ||
        ((t as any).customerName || t.customer || "").toLowerCase().includes(search.toLowerCase());
      const matchDate = !filterDate || t.date.slice(0, 10) === filterDate;
      return matchSearch && matchDate;
    });
  }, [transactions, search, filterDate]);

  const totalOmzet = filtered.reduce((s, t) => s + t.total, 0);

  const handlePrintStruk = (trx: any) => {
    const win = window.open("", "_blank", "width=320,height=600");
    if (!win) return;
    const itemsHtml = trx.items
      .map(
        (item: any) =>
          `<div class="row"><span>${item.product.name} x${item.qty}</span><span>${formatRupiah(item.product.sell_price * item.qty)}</span></div>`
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
      <div class="center bold" style="font-size:14px">${storeSettings.store_name}</div>
      <div class="center" style="font-size:11px;color:#555">${storeSettings.address}</div>
      <div class="center" style="font-size:11px;color:#555">${storeSettings.phone}</div>
      <hr>
      <div>Invoice: ${trx.invoice}</div>
      <div>Tanggal: ${trx.date.slice(0,16).replace("T"," ")}</div>
      <div>Kasir: ${trx.cashier}</div>
      <div>Pelanggan: ${trx.customerName || trx.customer || "Umum"}</div>
      <div>Metode: ${trx.isHutang ? "BON / HUTANG" : trx.payment_method}</div>
      <hr>
      ${itemsHtml}
      <hr>
      <div class="row bold"><span>Total</span><span>${formatRupiah(trx.total)}</span></div>
      ${!trx.isHutang && trx.payment_method === "tunai" ? `
        <div class="row"><span>Bayar</span><span>${formatRupiah(trx.amount_paid)}</span></div>
        <div class="row"><span>Kembali</span><span>${formatRupiah(trx.change)}</span></div>
      ` : ""}
      ${trx.isHutang ? `<div class="center bold" style="color:#b45309;margin-top:6px">* BELUM LUNAS *</div>` : ""}
      <hr>
      <div class="center" style="font-size:11px;color:#888;margin-top:8px">${(storeSettings.footer_receipt && !storeSettings.footer_receipt.includes("Makmur")) ? storeSettings.footer_receipt : ("Terima kasih telah berbelanja di " + storeSettings.store_name + "!")}</div>
      <script>window.onload=function(){window.print()}</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <>
      <Header title="Laporan & Riwayat" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="text-sm text-slate-500">Total Omzet (filter)</p>
            <p className="text-2xl font-bold text-green-600">{formatRupiah(totalOmzet)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">Jumlah Transaksi</p>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">Semua Transaksi</p>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </div>
        </div>

        <div className="card p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari invoice, kasir, pelanggan..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-400"
            />
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
          />
          {filterDate && (
            <button onClick={() => setFilterDate("")} className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
              Reset Tanggal
            </button>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Invoice</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Pelanggan</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Kasir</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Metode</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      Belum ada transaksi. Lakukan penjualan di Kasir.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-green-600">{t.invoice}</td>
                      <td className="px-4 py-3">{t.date.slice(0, 10)}</td>
                      <td className="px-4 py-3">{(t as any).customerName || t.customer || "Umum"}</td>
                      <td className="px-4 py-3">{t.cashier}</td>
                      <td className="px-4 py-3 capitalize">
                        {(t as any).isHutang ? (
                          <span className="badge badge-warning">Bon</span>
                        ) : (
                          t.payment_method
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{formatRupiah(t.total)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setDetail(t)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Detail">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => handlePrintStruk(t)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Cetak">
                            <Printer className="h-4 w-4" />
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

        {detail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Detail Invoice</h3>
                <button onClick={() => setDetail(null)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="font-medium text-green-600">{detail.invoice}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Tanggal</span><span>{detail.date.slice(0, 16).replace("T", " ")}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Kasir</span><span>{detail.cashier}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Pelanggan</span><span>{detail.customerName || detail.customer || "Umum"}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Metode</span><span className="capitalize">{detail.isHutang ? "Bon / Hutang" : detail.payment_method}</span></div>
              </div>
              <hr className="my-3" />
              <div className="space-y-2 text-sm">
                {detail.items.map((item: any) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span>{item.product.name} x{item.qty}</span>
                    <span className="font-medium">{formatRupiah(item.product.sell_price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-green-600">{formatRupiah(detail.total)}</span>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => handlePrintStruk(detail)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium">
                  <Printer className="h-4 w-4" /> Cetak Ulang
                </button>
                <button onClick={() => setDetail(null)} className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white">Tutup</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
