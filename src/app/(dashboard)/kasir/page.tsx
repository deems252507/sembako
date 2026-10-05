"use client";

import { useState, useMemo, useRef } from "react";
import Header from "@/components/Header";
import { useStore } from "@/store/useStore";
import { formatRupiah } from "@/lib/utils";
import { categories } from "@/lib/mock-data";
import {
  Search, Plus, Minus, Trash2, Package, X, ShoppingCart, CheckCircle, Printer, Camera,
} from "lucide-react";
import BarcodeScanner from "@/components/BarcodeScanner";

export default function KasirPage() {
  const {
    products, cart, addToCart, updateCartQty, removeFromCart, updateCartPrice,
    createTransaction, storeSettings, customers, addProduct,
  } = useStore();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"tunai" | "qris" | "transfer" | "hutang">("tunai");
  const [amountPaid, setAmountPaid] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", sku: "", barcode: "", category: "Sembako", unit: "pcs",
    buy_price: 0, sell_price: 0, stock: 0, min_stock: 5, status: "aktif" as const, image: "",
  });
  const printRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search));
      const matchCategory = activeCategory === "Semua" || p.category === activeCategory;
      return matchSearch && matchCategory && p.status === "aktif";
    });
  }, [products, search, activeCategory]);

  // Scan barcode: ketemu → keranjang; belum ada → form produk baru (barcode otomatis)
  const handleBarcodeScan = (value: string) => {
    const code = value.trim();
    if (!code) return;
    const found = products.find(
      (p) =>
        p.status === "aktif" &&
        (p.barcode === code || p.sku === code || p.barcode?.endsWith(code))
    );
    if (found) {
      addToCart(found);
      setSearch("");
      return;
    }
    // Produk belum terdaftar → buka form cepat
    setNewProduct({
      name: "",
      sku: code,
      barcode: code,
      category: "Sembako",
      unit: "pcs",
      buy_price: 0,
      sell_price: 0,
      stock: 0,
      min_stock: 5,
      status: "aktif",
      image: "",
    });
    setShowNewProduct(true);
    setSearch("");
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBarcodeScan(search);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.sell_price * item.qty - item.discount, 0);
  const total = subtotal;
  const change = Number(amountPaid) - total;

  const handlePay = () => {
    if (paymentMethod === "hutang" && !selectedCustomer) {
      alert("Pilih pelanggan untuk transaksi bon/hutang!");
      return;
    }
    const paid = paymentMethod === "tunai" ? Number(amountPaid) : (paymentMethod === "hutang" ? 0 : total);
    if (paymentMethod === "tunai" && paid < total) {
      alert("Uang tidak cukup!");
      return;
    }
    const trx = createTransaction(
      paymentMethod,
      paid,
      paymentMethod === "hutang" ? selectedCustomer : undefined
    );
    if (trx) {
      setLastTransaction(trx);
      setShowPayment(false);
      setShowSuccess(true);
      setAmountPaid("");
      setSelectedCustomer("");
      setShowCartMobile(false);
    }
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=320,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>Struk - ${storeSettings.store_name}</title>
      <style>
        body { font-family: monospace; font-size: 12px; width: 280px; margin: 0 auto; padding: 10px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        hr { border: none; border-top: 1px dashed #333; margin: 8px 0; }
        @media print { body { width: 100%; } }
      </style></head><body>
      ${content.innerHTML}
      <script>window.onload=function(){window.print();}</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <>
      <Header title="Kasir" />
      <main className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 space-y-3 border-b border-slate-200 bg-white">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  autoFocus
                  placeholder="Scan barcode / cari nama / SKU lalu Enter..."
                  className="w-full rounded-xl border-2 border-green-200 bg-green-50/50 py-3 pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" />
              </div>
              <button type="button" onClick={() => setShowScanner(true)}
                className="shrink-0 flex items-center gap-2 rounded-xl bg-green-600 px-4 text-white text-sm font-semibold hover:bg-green-700">
                <Camera className="h-5 w-5" />
                <span className="hidden sm:inline">Kamera</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 -mt-1">Scan barcode kemasan → produk masuk keranjang. Belum terdaftar? Langsung isi nama, harga & stok.</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={"shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
                    (activeCategory === cat ? "bg-green-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => (
                <button key={product.id} onClick={() => addToCart(product)}
                  className="card p-3 text-left hover:border-green-300 hover:shadow-md transition-all active:scale-[0.98]">
                  <div className="flex h-20 items-center justify-center rounded-lg bg-slate-50 mb-2 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-tight">{product.name}</p>
                  <p className="text-sm font-bold text-green-600 mt-1">{formatRupiah(product.sell_price)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Stok: {product.stock}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Desktop */}
        <div className="hidden lg:flex w-[380px] border-l border-slate-200 bg-white flex-col">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Keranjang
                {cart.length > 0 && (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {cart.reduce((s, i) => s + i.qty, 0)}
                  </span>
                )}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <ShoppingCart className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">Keranjang masih kosong</p>
                </div>
              ) : cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border overflow-hidden">
                    {item.product.image ? (
                      <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-slate-400">Rp</span>
                      <input
                        type="number"
                        value={item.product.sell_price}
                        onChange={(e) => updateCartPrice(item.product.id, Number(e.target.value) || 0)}
                        className="w-24 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-700 outline-none focus:border-green-400"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateCartQty(item.product.id, item.qty - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <button onClick={() => updateCartQty(item.product.id, item.qty + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="text-right min-w-[70px]">
                    <p className="text-sm font-semibold">{formatRupiah(item.product.sell_price * item.qty)}</p>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 p-4 space-y-3">
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-green-600">{formatRupiah(total)}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(["tunai", "qris", "transfer", "hutang"] as const).map((m) => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className={"rounded-xl py-2 text-xs font-semibold capitalize " +
                      (paymentMethod === m ? "border-2 border-green-500 bg-green-50 text-green-700" : "border border-slate-200 text-slate-600")}>
                    {m === "hutang" ? "Bon" : m === "tunai" ? "Tunai" : m === "qris" ? "QRIS" : "TF"}
                  </button>
                ))}
              </div>
              <button disabled={cart.length === 0} onClick={() => setShowPayment(true)}
                className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50">
                Bayar Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Mobile cart button */}
        <button onClick={() => setShowCartMobile(true)}
          className="lg:hidden fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg z-40">
          <ShoppingCart className="h-6 w-6" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
              {cart.reduce((s, i) => s + i.qty, 0)}
            </span>
          )}
        </button>

        {showCartMobile && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowCartMobile(false)} />
            <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Keranjang</h3>
                <button onClick={() => setShowCartMobile(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-slate-400">Rp</span>
                        <input type="number" value={item.product.sell_price}
                          onChange={(e) => updateCartPrice(item.product.id, Number(e.target.value) || 0)}
                          className="w-24 rounded-md border border-slate-200 px-1.5 py-0.5 text-xs outline-none focus:border-green-400" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateCartQty(item.product.id, item.qty - 1)} className="h-7 w-7 rounded-lg bg-white border flex items-center justify-center"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                      <button onClick={() => updateCartQty(item.product.id, item.qty + 1)} className="h-7 w-7 rounded-lg bg-white border flex items-center justify-center"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between font-bold"><span>Total</span><span className="text-green-600">{formatRupiah(total)}</span></div>
                <button disabled={cart.length === 0} onClick={() => setShowPayment(true)} className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white disabled:opacity-50">Bayar Sekarang</button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowPayment(false)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-bold mb-4">Pembayaran</h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-bold text-lg text-green-600">{formatRupiah(total)}</span></div>
                <div className="grid grid-cols-4 gap-2">
                  {(["tunai", "qris", "transfer", "hutang"] as const).map((m) => (
                    <button key={m} onClick={() => setPaymentMethod(m)}
                      className={"rounded-xl py-2.5 text-xs font-semibold " +
                        (paymentMethod === m ? "border-2 border-green-500 bg-green-50 text-green-700" : "border border-slate-200")}>
                      {m === "hutang" ? "Bon" : m === "tunai" ? "Tunai" : m === "qris" ? "QRIS" : "Transfer"}
                    </button>
                  ))}
                </div>

                {paymentMethod === "hutang" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Pilih Pelanggan (Bon)</label>
                    <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                      <option value="">-- Pilih Pelanggan --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.name}>{c.name} ({c.phone})</option>
                      ))}
                    </select>
                    <p className="text-xs text-amber-600 mt-1">Transaksi akan dicatat sebagai hutang pelanggan</p>
                  </div>
                )}

                {paymentMethod === "tunai" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Uang Diterima</label>
                      <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="Masukkan nominal..." autoFocus
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-400" />
                    </div>
                    {Number(amountPaid) >= total && (
                      <div className="flex justify-between text-sm bg-green-50 rounded-xl p-3">
                        <span className="text-green-700">Kembalian</span>
                        <span className="font-bold text-green-700">{formatRupiah(change)}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {[total, 50000, 100000, 200000].map((v) => (
                        <button key={v} onClick={() => setAmountPaid(String(v))}
                          className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-medium hover:bg-slate-50">
                          {v === total ? "Uang Pas" : formatRupiah(v)}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowPayment(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium">Batal</button>
                  <button onClick={handlePay} className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-bold text-white">Konfirmasi</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success + Struk + Print */}
        {showSuccess && lastTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowSuccess(false)} />
            <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <div className="text-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-bold">Transaksi Berhasil!</h3>
                {lastTransaction.isHutang && (
                  <p className="text-sm text-amber-600 mt-1">Bon atas nama: {lastTransaction.customerName}</p>
                )}
              </div>

              <div ref={printRef} className="border border-dashed border-slate-300 rounded-xl p-4 text-sm space-y-1 font-mono bg-slate-50">
                <p className="text-center font-bold text-base">{storeSettings.store_name}</p>
                <p className="text-center text-xs text-slate-500">{storeSettings.address}</p>
                <p className="text-center text-xs text-slate-500">{storeSettings.phone}</p>
                <hr className="my-2 border-slate-200" />
                <p>Invoice: {lastTransaction.invoice}</p>
                <p>Kasir: {lastTransaction.cashier}</p>
                <p>Pelanggan: {lastTransaction.customerName || "Umum"}</p>
                <p>Metode: {lastTransaction.isHutang ? "BON / HUTANG" : lastTransaction.payment_method}</p>
                <hr className="my-2 border-slate-200" />
                {lastTransaction.items.map((item: any) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span>{item.product.name} x{item.qty}</span>
                    <span>{formatRupiah(item.product.sell_price * item.qty)}</span>
                  </div>
                ))}
                <hr className="my-2 border-slate-200" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatRupiah(lastTransaction.total)}</span>
                </div>
                {!lastTransaction.isHutang && lastTransaction.payment_method === "tunai" && (
                  <>
                    <div className="flex justify-between"><span>Bayar</span><span>{formatRupiah(lastTransaction.amount_paid)}</span></div>
                    <div className="flex justify-between"><span>Kembali</span><span>{formatRupiah(lastTransaction.change)}</span></div>
                  </>
                )}
                {lastTransaction.isHutang && (
                  <p className="text-center text-amber-600 font-bold mt-1">* BELUM LUNAS *</p>
                )}
                <hr className="my-2 border-slate-200" />
                <p className="text-center text-xs text-slate-400 mt-2">{storeSettings.footer_receipt && !storeSettings.footer_receipt.includes("Makmur") ? storeSettings.footer_receipt : ("Terima kasih telah berbelanja di " + storeSettings.store_name + "!")}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={handlePrint}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-medium hover:bg-slate-50">
                  <Printer className="h-4 w-4" /> Cetak Struk
                </button>
                <button onClick={() => setShowSuccess(false)}
                  className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Form produk baru dari scan barcode */}
      {showNewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowNewProduct(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">Produk Baru dari Barcode</h3>
              <button onClick={() => setShowNewProduct(false)}><X className="h-5 w-5" /></button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Barcode dari kemasan sudah terisi. Lengkapi nama, harga, dan stok.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Barcode</label>
                <input value={newProduct.barcode} readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nama Produk *</label>
                <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  autoFocus placeholder="Contoh: Beras Ramos 5kg"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Harga Jual *</label>
                  <input type="number" value={newProduct.sell_price || ""} onChange={(e) => setNewProduct({ ...newProduct, sell_price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Harga Beli</label>
                  <input type="number" value={newProduct.buy_price || ""} onChange={(e) => setNewProduct({ ...newProduct, buy_price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Stok Awal</label>
                  <input type="number" value={newProduct.stock || ""} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                    <option>Sembako</option><option>Minuman</option><option>Makanan</option><option>Perawatan</option><option>Lainnya</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowNewProduct(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium">Batal</button>
                <button
                  onClick={() => {
                    if (!newProduct.name.trim()) return alert("Nama produk wajib diisi");
                    if (!newProduct.sell_price) return alert("Harga jual wajib diisi");
                    const sku = newProduct.sku || newProduct.barcode;
                    addProduct({ ...newProduct, sku });
                    // Zustand update sync — ambil produk by barcode dari getState
                    const { products: latest, addToCart: add } = useStore.getState();
                    const created = latest.find((p) => p.barcode === newProduct.barcode || p.sku === sku);
                    if (created) add(created);
                    setShowNewProduct(false);
                  }}
                  className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700"
                >
                  Simpan & ke Keranjang
                </button>
              </div>
              <button
                onClick={() => {
                  if (!newProduct.name.trim()) return alert("Nama produk wajib diisi");
                  if (!newProduct.sell_price) return alert("Harga jual wajib diisi");
                  addProduct({ ...newProduct, sku: newProduct.sku || newProduct.barcode });
                  setShowNewProduct(false);
                  alert("Produk disimpan. Stok: " + newProduct.stock);
                }}
                className="w-full rounded-xl border border-green-600 text-green-700 py-2.5 text-sm font-medium hover:bg-green-50"
              >
                Simpan saja (tanpa ke keranjang)
              </button>
            </div>
          </div>
        </div>
      )}

      {showScanner && (
        <BarcodeScanner
          onScan={(code) => {
            handleBarcodeScan(code);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
      </main>
    </>
  );
}

