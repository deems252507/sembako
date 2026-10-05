"use client";
import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";
import { X, Plus, Pencil, Trash2, Printer, Search } from "lucide-react";

export default function HutangPage() {
  const {
    customers, suppliers, transactions,
    bayarHutangPelanggan, bayarHutangSupplier,
    addCustomer, updateCustomer, deleteCustomer,
    storeSettings,
  } = useStore();

  const [tab, setTab] = useState<"piutang" | "hutang">("piutang");
  const [search, setSearch] = useState("");
  const [payModal, setPayModal] = useState<{ type: "pelanggan" | "supplier"; id: string; name: string; sisa: number } | null>(null);
  const [amount, setAmount] = useState("");
  const [formModal, setFormModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [detailCust, setDetailCust] = useState<typeof customers[0] | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    );
  }, [customers, search]);

  const piutang = filteredCustomers.filter((c) => c.sisaHutang > 0);
  const allFiltered = filteredCustomers;
  const hutangSupplier = suppliers.filter((s) => s.hutang > 0);
  const totalPiutang = customers.reduce((s, c) => s + c.sisaHutang, 0);
  const totalHutang = suppliers.reduce((s, c) => s + c.hutang, 0);

  const handleBayar = () => {
    if (!payModal) return;
    const nominal = Number(amount);
    if (!nominal || nominal <= 0) return alert("Masukkan nominal");
    if (nominal > payModal.sisa) return alert("Nominal melebihi sisa hutang");
    let ok = false;
    if (payModal.type === "pelanggan") ok = bayarHutangPelanggan(payModal.id, nominal);
    else {
      ok = bayarHutangSupplier(payModal.id, nominal);
      if (!ok) return alert("Saldo kas tidak cukup");
    }
    if (ok) {
      alert("Pembayaran berhasil!");
      setPayModal(null);
      setAmount("");
      setDetailCust(null);
    }
  };

  const openAdd = () => { setEditId(null); setName(""); setPhone(""); setFormModal(true); };
  const openEdit = (c: typeof customers[0]) => { setEditId(c.id); setName(c.name); setPhone(c.phone); setFormModal(true); };
  const handleSaveCustomer = () => {
    if (!name) return alert("Nama wajib");
    if (editId) updateCustomer(editId, { name, phone });
    else addCustomer(name, phone);
    setFormModal(false);
  };

  const handlePrintPiutang = () => {
    const bonTrx = transactions.filter((t) => (t as any).isHutang);
    const win = window.open("", "_blank");
    if (!win) return;

    // Group by customer
    const byCustomer: Record<string, typeof bonTrx> = {};
    bonTrx.forEach((t) => {
      const name = (t as any).customerName || t.customer || "Umum";
      if (!byCustomer[name]) byCustomer[name] = [];
      byCustomer[name].push(t);
    });

    // Also include customers with sisa hutang but maybe from seed data
    let bodyHtml = "";
    const printedNames = new Set<string>();

    Object.keys(byCustomer).forEach((custName) => {
      printedNames.add(custName);
      const list = byCustomer[custName];
      const custTotal = list.reduce((s, t) => s + t.total, 0);
      const phone = customers.find((c) => c.name === custName)?.phone || "-";

      bodyHtml += `<div class="cust">
        <h3>${custName} <span style="font-weight:normal;color:#666;font-size:12px">(${phone})</span></h3>`;

      list.forEach((t) => {
        const itemsRows = t.items.map((item: any) =>
          `<tr>
            <td>${item.product.name}</td>
            <td style="text-align:center">${item.qty}</td>
            <td style="text-align:right">${formatRupiah(item.product.sell_price)}</td>
            <td style="text-align:right">${formatRupiah(item.product.sell_price * item.qty)}</td>
          </tr>`
        ).join("");

        bodyHtml += `
        <div class="invoice">
          <div class="inv-head">
            <span><b>${t.invoice}</b></span>
            <span>${t.date.slice(0, 10)}</span>
            <span>Kasir: ${t.cashier}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Barang</th>
                <th style="text-align:center">Qty</th>
                <th style="text-align:right">Harga</th>
                <th style="text-align:right">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
          <div class="inv-total">Total Bon: <b>${formatRupiah(t.total)}</b></div>
        </div>`;
      });

      bodyHtml += `<div class="cust-total">Subtotal ${custName}: <b>${formatRupiah(custTotal)}</b></div></div>`;
    });

    // Customers with sisa hutang but no bon trx in history (seed)
    customers.filter((c) => c.sisaHutang > 0 && !printedNames.has(c.name)).forEach((c) => {
      bodyHtml += `<div class="cust">
        <h3>${c.name} <span style="font-weight:normal;color:#666;font-size:12px">(${c.phone})</span></h3>
        <p style="color:#666;font-size:12px">Sisa hutang (belum ada rincian transaksi di sistem): <b>${formatRupiah(c.sisaHutang)}</b></p>
      </div>`;
    });

    if (!bodyHtml) {
      bodyHtml = "<p>Tidak ada data piutang/bon.</p>";
    }

    const grandTotal = customers.reduce((s, c) => s + c.sisaHutang, 0);

    win.document.write(`
      <html><head><title>Laporan Piutang - ${storeSettings.store_name}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 24px; font-size: 13px; color: #222; }
        h1 { font-size: 18px; margin: 0 0 4px; }
        .sub { color: #555; margin: 0 0 16px; font-size: 12px; }
        .cust { margin-bottom: 24px; page-break-inside: avoid; }
        .cust h3 { margin: 0 0 8px; font-size: 14px; border-bottom: 2px solid #14532d; padding-bottom: 4px; color: #14532d; }
        .invoice { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; margin: 8px 0; background: #fafafa; }
        .inv-head { display: flex; gap: 16px; flex-wrap: wrap; font-size: 12px; margin-bottom: 8px; color: #444; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
        th { background: #f3f4f6; font-weight: 600; }
        .inv-total { text-align: right; margin-top: 6px; font-size: 13px; }
        .cust-total { text-align: right; font-size: 13px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #ccc; }
        .grand { margin-top: 20px; font-size: 15px; font-weight: bold; text-align: right; padding: 12px; background: #f0fdf4; border-radius: 8px; }
      </style></head><body>
      <h1>${storeSettings.store_name}</h1>
      <p class="sub">Laporan Piutang / Bon Pelanggan — ${new Date().toLocaleDateString("id-ID")}<br/>
      ${storeSettings.address} | ${storeSettings.phone}</p>
      ${bodyHtml}
      <div class="grand">Total Piutang: ${formatRupiah(grandTotal)}</div>
      <script>window.onload=function(){window.print()}</script>
      </body></html>
    `);
    win.document.close();
  };


  return (
    <>
      <Header title="Hutang & Piutang" />
      <main className="p-4 lg:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="text-sm text-slate-500">Total Piutang Pelanggan</p>
            <p className="text-2xl font-bold text-amber-600">{formatRupiah(totalPiutang)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-slate-500">Total Hutang Supplier</p>
            <p className="text-2xl font-bold text-red-600">{formatRupiah(totalHutang)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTab("piutang")}
            className={"rounded-full px-4 py-1.5 text-sm font-medium " + (tab === "piutang" ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600")}>
            Piutang Pelanggan
          </button>
          <button onClick={() => setTab("hutang")}
            className={"rounded-full px-4 py-1.5 text-sm font-medium " + (tab === "hutang" ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600")}>
            Hutang Supplier
          </button>
        </div>

        {tab === "piutang" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative flex-1 w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama / no HP pelanggan..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-400" />
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrintPiutang}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
                  <Printer className="h-4 w-4" /> Cetak Piutang
                </button>
                <button onClick={openAdd}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700">
                  <Plus className="h-4 w-4" /> Tambah Pelanggan
                </button>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Nama</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">No HP</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Total Belanja</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Sisa Hutang</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFiltered.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Tidak ada data</td></tr>
                    ) : allFiltered.map((c) => (
                      <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium">{c.name}</td>
                        <td className="px-4 py-3">{c.phone}</td>
                        <td className="px-4 py-3">{formatRupiah(c.totalBelanja)}</td>
                        <td className={"px-4 py-3 " + (c.sisaHutang > 0 ? "text-red-600 font-medium" : "")}>{formatRupiah(c.sisaHutang)}</td>
                        <td className="px-4 py-3">
                          <span className={"badge " + (c.sisaHutang > 0 ? "badge-warning" : "badge-success")}>
                            {c.sisaHutang > 0 ? "Ada Hutang" : "Lunas"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {c.sisaHutang > 0 && (
                              <button
                                onClick={() => { setPayModal({ type: "pelanggan", id: c.id, name: c.name, sisa: c.sisaHutang }); setAmount(String(c.sisaHutang)); }}
                                className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white"
                              >Bayar</button>
                            )}
                            <button onClick={() => setDetailCust(c)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium">Detail</button>
                            <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => { if (confirm("Hapus " + c.name + "?")) deleteCustomer(c.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "hutang" && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Supplier</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Hutang</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {hutangSupplier.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">Tidak ada hutang supplier</td></tr>
                ) : hutangSupplier.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{formatRupiah(s.hutang)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setPayModal({ type: "supplier", id: s.id, name: s.name, sisa: s.hutang }); setAmount(String(s.hutang)); }}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >Bayar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pay Modal */}
        {payModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setPayModal(null)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Bayar Hutang</h3>
                <button onClick={() => setPayModal(null)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-3 text-sm">
                  <p className="font-semibold">{payModal.name}</p>
                  <p className="text-slate-500">Sisa: <span className="text-red-600 font-medium">{formatRupiah(payModal.sisa)}</span></p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nominal Bayar</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" autoFocus />
                </div>
                <button onClick={() => setAmount(String(payModal.sisa))} className="text-sm text-green-600 font-medium">Bayar Lunas</button>
                <button onClick={handleBayar} className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white">Konfirmasi Bayar</button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Form */}
        {formModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFormModal(false)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">{editId ? "Edit Pelanggan" : "Tambah Pelanggan"}</h3>
                <button onClick={() => setFormModal(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">No HP</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <button onClick={handleSaveCustomer} className="w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white">
                  {editId ? "Simpan Perubahan" : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Customer */}
        {detailCust && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDetailCust(null)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Detail Pelanggan</h3>
                <button onClick={() => setDetailCust(null)}><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-slate-500">Nama</span><span className="font-medium">{detailCust.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">No HP</span><span>{detailCust.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Sisa Hutang</span><span className="font-bold text-red-600">{formatRupiah(detailCust.sisaHutang)}</span></div>
              </div>
              <h4 className="text-sm font-semibold mb-2 text-slate-700">Rincian Bon</h4>
              <div className="space-y-3">
                {transactions.filter((t) => (t as any).isHutang && ((t as any).customerName === detailCust.name || t.customer === detailCust.name)).length === 0 ? (
                  <p className="text-sm text-slate-400">Belum ada rincian transaksi bon di sistem.</p>
                ) : (
                  transactions
                    .filter((t) => (t as any).isHutang && ((t as any).customerName === detailCust.name || t.customer === detailCust.name))
                    .map((t) => (
                      <div key={t.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-green-600">{t.invoice}</span>
                          <span className="text-slate-400 text-xs">{t.date.slice(0, 10)}</span>
                        </div>
                        {t.items.map((item: any) => (
                          <div key={item.product.id} className="flex justify-between text-slate-600 py-0.5">
                            <span>{item.product.name} x{item.qty}</span>
                            <span>{formatRupiah(item.product.sell_price * item.qty)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-bold mt-2 pt-2 border-t border-slate-100">
                          <span>Total Bon</span>
                          <span className="text-red-600">{formatRupiah(t.total)}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
              <div className="flex gap-2 mt-5">
                {detailCust.sisaHutang > 0 && (
                  <button
                    onClick={() => { setPayModal({ type: "pelanggan", id: detailCust.id, name: detailCust.name, sisa: detailCust.sisaHutang }); setAmount(String(detailCust.sisaHutang)); setDetailCust(null); }}
                    className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white"
                  >Bayar Hutang</button>
                )}
                <button onClick={() => { openEdit(detailCust); setDetailCust(null); }} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium">Edit</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
