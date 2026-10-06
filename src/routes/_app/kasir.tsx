import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Minus,
  Package,
  Plus,
  Printer,
  ScanLine,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { MoneyInput } from "@/components/money-input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { checkoutSale, upsertProduct } from "@/lib/pos/actions";
import { findByExactBarcode } from "@/lib/pos/identity";
import { playScanBeep } from "@/lib/pos/scan-beep";
import { usePosStore } from "@/lib/pos/store";
import type { PaymentMethod, Product, Sale } from "@/lib/pos/types";
import { CATEGORIES } from "@/lib/pos/types";
import { cn, formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/_app/kasir")({ component: KasirPage });

function KasirPage() {
  const user = useCurrentUser();
  const products = usePosStore((s) => s.products);
  const customers = usePosStore((s) => s.customers);
  const profile = usePosStore((s) => s.profile);
  const cart = usePosStore((s) => s.cart);
  const apply = usePosStore((s) => s.apply);
  const addToCart = usePosStore((s) => s.addToCart);
  const updateCartQty = usePosStore((s) => s.updateCartQty);
  const updateCartPrice = usePosStore((s) => s.updateCartPrice);
  const removeFromCart = usePosStore((s) => s.removeFromCart);
  const clearCart = usePosStore((s) => s.clearCart);

  const scanRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [scanPulse, setScanPulse] = useState(false);
  const [lastScan, setLastScan] = useState<{ code: string; name: string } | null>(null);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [camera, setCamera] = useState(false);
  const [mobileCart, setMobileCart] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("tunai");
  const [paid, setPaid] = useState(0);
  const [customerId, setCustomerId] = useState("");
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const [unknownCode, setUnknownCode] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    sellPrice: 0,
    buyPrice: 0,
    stock: 0,
    category: "Sembako",
  });

  const modalOpen = camera || payOpen || Boolean(unknownCode) || Boolean(receipt);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((p) => {
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q);
      const matchCat = category === "Semua" || p.category === category;
      return matchQ && matchCat && p.status === "aktif";
    });
  }, [products, query, category]);

  const total = cart.reduce((s, i) => s + i.product.sellPrice * i.qty - i.discount, 0);
  const qtyTotal = cart.reduce((s, i) => s + i.qty, 0);

  const applyCode = useCallback(
    (raw: string): { ok: boolean; label?: string } => {
      const code = raw.trim();
      if (!code) return { ok: false };
      const found = findByExactBarcode(products, code);
      if (found && found.status === "aktif") {
        const inCart = cart.find((item) => item.product.id === found.id)?.qty ?? 0;
        if (found.stock <= 0 || inCart >= found.stock) {
          toast.error(`${found.name} stok tidak cukup`);
          return { ok: false, label: "Stok tidak cukup" };
        }
        addToCart(found);
        setLastScan({ code, name: found.name });
        setScanLog((log) => [found.name, ...log].slice(0, 5));
        setScanPulse(true);
        window.setTimeout(() => setScanPulse(false), 350);
        toast.success(`${found.name} masuk keranjang`);
        return { ok: true, label: found.name };
      }
      setUnknownCode(code);
      setNewProduct({ name: "", sellPrice: 0, buyPrice: 0, stock: 0, category: "Sembako" });
      return { ok: false, label: "Produk belum terdaftar" };
    },
    [addToCart, cart, products],
  );

  useEffect(() => {
    const focus = () => {
      if (!modalOpen) scanRef.current?.focus();
    };
    focus();
    const t = window.setInterval(focus, 1200);
    return () => window.clearInterval(t);
  }, [modalOpen]);

  useEffect(() => {
    let buf = "";
    let last = 0;
    const onKey = (e: KeyboardEvent) => {
      if (modalOpen) return;
      const el = e.target as HTMLElement;
      if (el === scanRef.current) return;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") return;
      const now = Date.now();
      if (now - last > 50) buf = "";
      last = now;
      if (e.key === "Enter") {
        if (buf.length >= 4) {
          e.preventDefault();
          applyCode(buf);
        }
        buf = "";
      } else if (e.key.length === 1) {
        buf += e.key;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyCode, modalOpen]);

  const pay = async () => {
    if (cart.length === 0) return;
    if (method === "hutang" && !customerId) {
      toast.error("Pilih pelanggan untuk bon");
      return;
    }
    const amount = method === "tunai" ? paid : total;
    if (method === "tunai" && amount < total) {
      toast.error("Uang tidak cukup");
      return;
    }
    const customer = customers.find((c) => c.id === customerId);
    try {
      const result = await checkoutSale({
        data: {
          cashier: user?.displayName || "Kasir",
          customerId: method === "hutang" ? customerId : customerId || null,
          customerName: customer?.name || "Umum",
          paymentMethod: method,
          amountPaid: amount,
          items: cart.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            qty: i.qty,
            price: i.product.sellPrice,
            buyPrice: i.product.buyPrice,
            discount: i.discount,
          })),
        },
      });
      apply(result.snapshot);
      clearCart();
      setPayOpen(false);
      setPaid(0);
      setCustomerId("");
      setMobileCart(false);
      setReceipt(result.sale);
      playScanBeep("ok");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transaksi gagal");
    }
  };

  const printReceipt = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=320,height=600");
    if (!win) return;
    win.document.write(
      `<html><head><title>Struk</title><style>body{font-family:ui-monospace,monospace;font-size:12px;width:280px;margin:0 auto;padding:12px}</style></head><body>${content.innerHTML}</body></html>`,
    );
    win.document.close();
    win.print();
  };

  return (
    <>
      <PageHeader title="Kasir" subtitle="Siap memindai — kamera, USB, atau ketik barcode" />
      <main className="flex h-[calc(100dvh-4rem)] flex-col lg:flex-row">
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-border bg-surface px-4 py-3">
            <div
              className={cn(
                "flex items-center gap-2 rounded-2xl border-2 bg-elevated px-3 py-2 transition-colors duration-150",
                scanPulse ? "border-accent bg-accent-soft" : "border-accent/30",
              )}
            >
              <ScanLine className="h-5 w-5 text-accent" />
              <input
                ref={scanRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (query.trim()) {
                      applyCode(query);
                      setQuery("");
                    }
                  }
                }}
                placeholder="Scan barcode, SKU, atau nama produk"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
              />
              <span className="hidden items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-success sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Siap scan
              </span>
              <button
                type="button"
                onClick={() => setCamera(true)}
                className="btn-primary h-10 px-3"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Scan Barcode</span>
              </button>
            </div>
            {lastScan ? (
              <p className="mt-2 text-xs text-muted">
                Terakhir: <span className="font-medium text-fg">{lastScan.name}</span>{" "}
                <span className="font-mono text-subtle">{lastScan.code}</span>
              </p>
            ) : (
              <p className="mt-2 text-xs text-subtle">
                Scanner USB langsung mengetik ke kolom ini. Kamera memakai bingkai + laser.
              </p>
            )}
            {scanLog.length > 0 ? (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {scanLog.map((name, i) => (
                  <span key={`${name}-${i}`} className="badge badge-success shrink-0">
                    {name}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium",
                    category === cat ? "bg-accent text-accent-fg" : "bg-bg text-muted",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToCart(p)}
                  className="card p-3 text-left transition-transform duration-150 hover:border-accent/40 active:scale-[0.98]"
                >
                  <div className="mb-2 flex h-16 items-center justify-center overflow-hidden rounded-lg bg-bg">
                    {p.image ? (
                      <img src={p.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-7 w-7 text-subtle" />
                    )}
                  </div>
                  <p className="line-clamp-2 text-sm font-medium leading-tight">{p.name}</p>
                  <p className="mt-1 text-sm font-semibold text-accent tabular">
                    {formatRupiah(p.sellPrice)}
                  </p>
                  <p className="text-[11px] text-subtle">Stok {p.stock}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="hidden w-[380px] flex-col border-l border-border bg-surface lg:flex">
          <CartPanel
            cart={cart}
            total={total}
            qtyTotal={qtyTotal}
            method={method}
            setMethod={setMethod}
            onPay={() => setPayOpen(true)}
            updateCartQty={updateCartQty}
            updateCartPrice={updateCartPrice}
            removeFromCart={removeFromCart}
          />
        </aside>

        <button
          type="button"
          onClick={() => setMobileCart(true)}
          className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-fg shadow-lg lg:hidden"
        >
          <ShoppingCart className="h-6 w-6" />
          {qtyTotal > 0 ? (
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-danger text-[10px] font-bold text-accent-fg">
              {qtyTotal}
            </span>
          ) : null}
        </button>
      </main>

      {mobileCart ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ink/40" onClick={() => setMobileCart(false)} />
          <div className="absolute inset-x-0 bottom-0 flex h-[88dvh] flex-col rounded-t-3xl bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-semibold">Keranjang</h3>
              <button type="button" onClick={() => setMobileCart(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <CartPanel
              cart={cart}
              total={total}
              qtyTotal={qtyTotal}
              method={method}
              setMethod={setMethod}
              onPay={() => setPayOpen(true)}
              updateCartQty={updateCartQty}
              updateCartPrice={updateCartPrice}
              removeFromCart={removeFromCart}
            />
          </div>
        </div>
      ) : null}

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Pembayaran">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted">Total</span>
            <span className="font-display text-2xl text-accent tabular">{formatRupiah(total)}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(["tunai", "qris", "transfer", "hutang"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={cn(
                  "rounded-xl py-2.5 text-xs font-semibold capitalize",
                  method === m ? "border-2 border-accent bg-accent-soft text-success" : "border border-border",
                )}
              >
                {m === "hutang" ? "Bon" : m}
              </button>
            ))}
          </div>
          {method === "hutang" ? (
            <select className="field" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Pilih pelanggan</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : null}
          {method === "tunai" ? (
            <>
              <MoneyInput placeholder="Uang diterima" value={paid} onChange={setPaid} />
              {paid >= total ? (
                <div className="flex justify-between rounded-xl bg-accent-soft p-3 text-sm text-success">
                  <span>Kembalian</span>
                  <span className="font-semibold tabular">{formatRupiah(paid - total)}</span>
                </div>
              ) : null}
              <div className="grid grid-cols-4 gap-2">
                {[total, 50000, 100000, 200000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPaid(v)}
                    className="rounded-lg border border-border py-2 text-[11px] font-medium"
                  >
                    {v === total ? "Uang pas" : formatRupiah(v)}
                  </button>
                ))}
              </div>
            </>
          ) : null}
          <div className="flex gap-2">
            <button type="button" className="btn-ghost flex-1" onClick={() => setPayOpen(false)}>
              Batal
            </button>
            <button type="button" className="btn-primary flex-1" onClick={() => void pay()}>
              Konfirmasi
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(receipt)} onClose={() => setReceipt(null)} title="Transaksi berhasil">
        {receipt ? (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
              {receipt.isDebt ? (
                <p className="mt-2 text-sm text-warning">Bon atas nama {receipt.customerName}</p>
              ) : null}
            </div>
            <div ref={printRef} className="space-y-1 rounded-xl border border-dashed border-border bg-bg p-4 font-mono text-xs">
              <p className="text-center text-sm font-bold">{profile.storeName}</p>
              <p className="text-center text-subtle">{profile.address}</p>
              <p className="text-center text-subtle">{profile.phone}</p>
              <hr className="my-2 border-border" />
              <p>Invoice: {receipt.invoice}</p>
              <p>Kasir: {receipt.cashier}</p>
              <p>Pelanggan: {receipt.customerName}</p>
              <p>Metode: {receipt.isDebt ? "BON" : receipt.paymentMethod}</p>
              <hr className="my-2 border-border" />
              {receipt.items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span>
                    {item.name} x{item.qty}
                  </span>
                  <span>{formatRupiah(item.price * item.qty)}</span>
                </div>
              ))}
              <hr className="my-2 border-border" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatRupiah(receipt.total)}</span>
              </div>
              {profile.footerReceipt ? (
                <p className="pt-2 text-center text-subtle">{profile.footerReceipt}</p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost flex-1" onClick={printReceipt}>
                <Printer className="h-4 w-4" /> Cetak
              </button>
              <button type="button" className="btn-primary flex-1" onClick={() => setReceipt(null)}>
                Tutup
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(unknownCode)}
        onClose={() => setUnknownCode("")}
        title="Barcode tidak ditemukan."
      >
        <p className="mb-3 text-sm text-muted">
          Barcode <span className="font-mono">{unknownCode}</span> belum terdaftar.
        </p>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button type="button" className="btn-ghost" onClick={() => { setUnknownCode(""); setCamera(true); }}>Scan Lagi</button>
          <button type="button" className="btn-primary" onClick={() => scanRef.current?.focus()}>Tambah Produk</button>
        </div>
        <div className="space-y-3">
          <input
            className="field"
            autoFocus
            placeholder="Nama produk"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <input className="field" readOnly value="SKU otomatis" />
          <input className="field font-mono" readOnly value={unknownCode} />
          <div className="grid grid-cols-2 gap-2">
            <MoneyInput placeholder="Harga jual" value={newProduct.sellPrice} onChange={(sellPrice) => setNewProduct({ ...newProduct, sellPrice })} />
            <MoneyInput placeholder="Harga beli" value={newProduct.buyPrice} onChange={(buyPrice) => setNewProduct({ ...newProduct, buyPrice })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="field"
              type="number"
              placeholder="Stok awal"
              value={newProduct.stock || ""}
              onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
            />
            <select
              className="field"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            >
              {CATEGORIES.filter((c) => c !== "Semua").map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn-primary w-full"
            onClick={async () => {
              if (!newProduct.name.trim() || !newProduct.sellPrice) {
                toast.error("Nama dan harga jual wajib");
                return;
              }
              const snap = await upsertProduct({
                data: {
                  name: newProduct.name,
                  sku: "",
                  barcode: unknownCode,
                  category: newProduct.category,
                  unit: "pcs",
                  buyPrice: newProduct.buyPrice,
                  sellPrice: newProduct.sellPrice,
                  stock: newProduct.stock,
                  minStock: 5,
                  image: "",
                  status: "aktif",
                },
              });
              apply(snap);
              const created = snap.products.find((p) => p.barcode === unknownCode);
              if (created) addToCart(created);
              setUnknownCode("");
              toast.success("Produk disimpan dan masuk keranjang");
            }}
          >
            Simpan & ke keranjang
          </button>
        </div>
      </Modal>

      {camera ? (
        <BarcodeScanner
          onScan={applyCode}
          onClose={() => setCamera(false)}
        />
      ) : null}
    </>
  );
}

function CartPanel({
  cart,
  total,
  qtyTotal,
  method,
  setMethod,
  onPay,
  updateCartQty,
  updateCartPrice,
  removeFromCart,
}: {
  cart: { product: Product; qty: number; discount: number }[];
  total: number;
  qtyTotal: number;
  method: PaymentMethod;
  setMethod: (m: PaymentMethod) => void;
  onPay: () => void;
  updateCartQty: (id: string, qty: number) => void;
  updateCartPrice: (id: string, price: number) => void;
  removeFromCart: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="flex items-center gap-2 font-semibold">
          <ShoppingCart className="h-4 w-4" /> Keranjang
          {qtyTotal > 0 ? <span className="badge badge-success">{qtyTotal}</span> : null}
        </h3>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="grid h-40 place-items-center text-center text-subtle">
            <div>
              <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">Scan barang untuk mulai</p>
            </div>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.product.id} className="rounded-xl bg-bg p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{item.product.name}</p>
                <button type="button" onClick={() => removeFromCart(item.product.id)} className="text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <input
                  type="number"
                  className="field w-24 py-1"
                  value={item.product.sellPrice}
                  onChange={(e) => updateCartPrice(item.product.id, Number(e.target.value) || 0)}
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-elevated"
                    onClick={() => updateCartQty(item.product.id, item.qty - 1)}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                  <button
                    type="button"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-elevated"
                    onClick={() => updateCartQty(item.product.id, item.qty + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-1 text-right text-sm font-semibold tabular">
                {formatRupiah(item.product.sellPrice * item.qty)}
              </p>
            </div>
          ))
        )}
      </div>
      <div className="space-y-3 border-t border-border p-4">
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span className="text-accent tabular">{formatRupiah(total)}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {(["tunai", "qris", "transfer", "hutang"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={cn(
                "rounded-xl py-2 text-[11px] font-semibold capitalize",
                method === m ? "border-2 border-accent bg-accent-soft text-success" : "border border-border text-muted",
              )}
            >
              {m === "hutang" ? "Bon" : m === "transfer" ? "TF" : m}
            </button>
          ))}
        </div>
        <button type="button" disabled={cart.length === 0} className="btn-primary w-full" onClick={onPay}>
          Bayar sekarang
        </button>
      </div>
    </div>
  );
}
