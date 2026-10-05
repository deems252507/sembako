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

    const byCustomer: Record<string, typeof bonTrx> = {};
    bonTrx.forEach((t) => {
      const name = (t as any).customerName || t.customer || "Umum";
      if (!byCustomer[name]) byCustomer[name] = [];
      byCustomer[name].push(t);
    });

    let bodyHtml = "";
    const printedNames = new Set<string>();
    let no = 0;

    Object.keys(byCustomer).forEach((custName) => {
      printedNames.add(custName);
      const list = byCustomer[custName];
      const custTotal = list.reduce((s, t) => s + t.total, 0);
      const phone = customers.find((c) => c.name === custName)?.phone || "-";
      no += 1;

      let invBlocks = "";
      list.forEach((t, idx) => {
        const itemsRows = t.items.map((item: any, i: number) =>
          `<tr>
            <td class="c">${i + 1}</td>
            <td>${item.product.name}</td>
            <td class="c">${item.qty}</td>
            <td class="r">${formatRupiah(item.product.sell_price)}</td>
            <td class="r">${formatRupiah(item.product.sell_price * item.qty)}</td>
          </tr>`
        ).join("");

        invBlocks += `
        <div class="box">
          <div class="meta">
            <span><b>No. ${t.invoice}</b></span>
            <span>${t.date.slice(0, 10)}</span>
            <span>Kasir: ${t.cashier}</span>
            <span style="color:#b91c1c;font-weight:700">BELUM LUNAS</span>
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

      bodyHtml += `
      <section class="cust">
        <div class="cust-head">
          <div>
            <span class="badge">${no}</span>
            <strong>${custName}</strong>
            <span class="phone">${phone}</span>
          </div>
          <div class="cust-sum">Sisa: <b>${formatRupiah(custTotal)}</b></div>
        </div>
        ${invBlocks}
      </section>`;
    });

    customers.filter((c) => c.sisaHutang > 0 && !printedNames.has(c.name)).forEach((c) => {
      no += 1;
      bodyHtml += `
      <section class="cust">
        <div class="cust-head">
          <div>
            <span class="badge">${no}</span>
            <strong>${c.name}</strong>
            <span class="phone">${c.phone}</span>
          </div>
          <div class="cust-sum">Sisa: <b>${formatRupiah(c.sisaHutang)}</b></div>
        </div>
        <p class="note">Belum ada rincian transaksi bon di sistem.</p>
      </section>`;
    });

    if (!bodyHtml) bodyHtml = '<p class="empty">Tidak ada data piutang.</p>';

    const grandTotal = customers.reduce((s, c) => s + c.sisaHutang, 0);
    const tgl = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8"/>
<title>Laporan Piutang - ${storeSettings.store_name}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Segoe UI", Tahoma, Arial, sans-serif;
    font-size: 11px;
    color: #1a1a1a;
    line-height: 1.45;
    padding: 0;
  }
  .header {
    border-bottom: 2px solid #14532d;
    padding-bottom: 12px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .header h1 {
    font-size: 16px;
    color: #14532d;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  .header .addr {
    font-size: 10px;
    color: #555;
    margin-top: 3px;
  }
  .header .title-right {
    text-align: right;
  }
  .header .title-right .doc {
    font-size: 13px;
    font-weight: 700;
    color: #14532d;
  }
  .header .title-right .tgl {
    font-size: 10px;
    color: #666;
    margin-top: 2px;
  }
  .cust {
    margin-bottom: 18px;
    page-break-inside: avoid;
  }
  .cust-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 4px;
    padding: 8px 10px;
    margin-bottom: 8px;
  }
  .badge {
    display: inline-block;
    background: #14532d;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border-radius: 50%;
    margin-right: 8px;
  }
  .phone { color: #666; margin-left: 8px; font-weight: 400; }
  .cust-sum { font-size: 11px; color: #166534; }
  .box {
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    margin-bottom: 8px;
    overflow: hidden;
  }
  .meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    background: #f8fafc;
    padding: 6px 10px;
    font-size: 10px;
    color: #475569;
    border-bottom: 1px solid #e5e7eb;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th {
    background: #f1f5f9;
    font-weight: 600;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: #475569;
    padding: 6px 8px;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
  }
  td {
    padding: 5px 8px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 11px;
  }
  tbody tr:last-child td { border-bottom: none; }
  tfoot td {
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    padding: 6px 8px;
    font-size: 11px;
  }
  .c { text-align: center; }
  .r { text-align: right; }
  .note { color: #94a3b8; font-size: 10px; padding: 6px 0; font-style: italic; }
  .empty { text-align: center; color: #94a3b8; padding: 32px; }
  .footer-total {
    margin-top: 20px;
    border: 2px solid #14532d;
    border-radius: 4px;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f0fdf4;
  }
  .footer-total .label {
    font-size: 12px;
    font-weight: 600;
    color: #14532d;
  }
  .footer-total .amount {
    font-size: 16px;
    font-weight: 700;
    color: #14532d;
  }
  .sign {
    margin-top: 28px;
    display: flex;
    justify-content: flex-end;
  }
  .sign-box {
    text-align: center;
    width: 180px;
    font-size: 10px;
    color: #555;
  }
  .sign-box .space { height: 48px; }
  .sign-box .line { border-top: 1px solid #333; margin-top: 4px; padding-top: 4px; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head><body>
  <div class="header">
    <div>
      <h1>${storeSettings.store_name}</h1>
      <div class="addr">${storeSettings.address}</div>
      <div class="addr">Telp/WA: ${storeSettings.phone}</div>
    </div>
    <div class="title-right">
      <div class="doc">LAPORAN PIUTANG / BON</div>
      <div class="tgl">${tgl}</div>
    </div>
  </div>

  ${bodyHtml}

  <div class="footer-total">
    <span class="label">TOTAL PIUTANG KESELURUHAN</span>
    <span class="amount">${formatRupiah(grandTotal)}</span>
  </div>

  <div class="sign">
    <div class="sign-box">
      <div>Mengetahui,</div>
      <div class="space"></div>
      <div class="line">(${storeSettings.store_name})</div>
    </div>
  </div>

  <script>window.onload=function(){window.print()}</script>
</body></html>`);
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
