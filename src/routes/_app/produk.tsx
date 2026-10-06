import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, ImagePlus, Package, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { MoneyInput } from "@/components/money-input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { deleteProduct, upsertProduct } from "@/lib/pos/actions";
import { findByExactBarcode, findByExactName } from "@/lib/pos/identity";
import { usePosStore } from "@/lib/pos/store";
import { CATEGORIES, type Product } from "@/lib/pos/types";
import { formatNumber, formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/_app/produk")({ component: ProdukPage });

const empty: {
  name: string;
  sku: string;
  barcode: string;
  category: string;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  sellPriceDus: number;
  buyPriceDus: number;
  pcsPerDus: number;
  stock: number;
  stockDus: number;
  minStock: number;
  image: string;
  status: "aktif" | "nonaktif";
} = {
  name: "",
  sku: "",
  barcode: "",
  category: "Sembako",
  unit: "pcs",
  buyPrice: 0,
  sellPrice: 0,
  sellPriceDus: 0,
  buyPriceDus: 0,
  pcsPerDus: 12,
  stock: 0,
  stockDus: 0,
  minStock: 5,
  image: "",
  status: "aktif",
};

function ProdukPage() {
  const products = usePosStore((s) => s.products);
  const apply = usePosStore((s) => s.apply);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [camera, setCamera] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<"list" | "form">("list");
  const [duplicate, setDuplicate] = useState<Product | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.sku.toLowerCase().includes(q.toLowerCase()) ||
      p.barcode.includes(q),
  );

  const openAdd = () => {
    setEditId(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category,
      unit: p.unit || "pcs",
      buyPrice: p.buyPrice,
      sellPrice: p.sellPrice,
      sellPriceDus: p.sellPriceDus || 0,
      buyPriceDus: p.buyPriceDus || 0,
      pcsPerDus: p.pcsPerDus || 12,
      stock: p.stock,
      stockDus: p.stockDus || 0,
      minStock: p.minStock,
      image: p.image,
      status: p.status,
    });
    setOpen(true);
  };

  const handleProductScan = (code: string) => {
    const value = code.trim();
    if (!value) return;
    const found = products.find(
      (p) => p.status === "aktif" && (p.barcode === value || p.sku === value),
    );
    if (found) {
      setEditId(found.id);
      setForm({
        name: found.name,
        sku: found.sku,
        barcode: found.barcode,
        category: found.category,
        unit: found.unit,
        buyPrice: found.buyPrice,
        sellPrice: found.sellPrice,
        stock: found.stock,
        minStock: found.minStock,
        image: found.image,
        status: found.status,
      });
      setOpen(true);
      toast.success(`${found.name} ditemukan`);
      return;
    }
    setEditId(null);
    setForm({ ...empty, barcode: value });
    setOpen(true);
    toast.success("Barcode dimasukkan. Lengkapi data produk.");
  };

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Gunakan gambar JPG, JPEG, PNG, atau WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result || "");
      const img = new Image();
      img.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setForm((current) => ({ ...current, image: source }));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/webp", 0.82);
        setForm((current) => ({ ...current, image: compressed }));
      };
      img.onerror = () => toast.error("Gambar tidak dapat dibaca.");
      img.src = source;
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const barcodeOwner = findByExactBarcode(products, form.barcode, editId);
  const nameOwner = findByExactName(products, form.name, editId);

  const persist = async () => {
    if (!form.name.trim()) return toast.error("Nama produk wajib");
    if (barcodeOwner) {
      toast.error("Barcode sudah digunakan oleh produk ini.");
      return;
    }
    try {
      const snap = await upsertProduct({ data: { ...form, id: editId ?? undefined } });
      apply(snap);
      setOpen(false);
      setDuplicate(null);
      toast.success("Produk disimpan");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const marker = "PRODUCT_CONFLICT:";
      const idx = message.indexOf(marker);
      if (idx >= 0) {
        const payload = JSON.parse(message.slice(idx + marker.length)) as { product: Product };
        setDuplicate(payload.product);
        toast.error("Barcode sudah digunakan oleh produk ini.");
        return;
      }
      toast.error(message || "Produk gagal disimpan");
    }
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Nama produk wajib");
    if (barcodeOwner) {
      setDuplicate(barcodeOwner);
      return;
    }
    if (!editId && nameOwner) {
      setDuplicate(nameOwner);
      return;
    }
    await persist();
  };

  return (
    <>
      <PageHeader title="Produk" subtitle={`${products.length} item di etalase`} />
      <main className="page-main space-y-4 p-4 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input className="field pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, SKU, barcode" />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost" onClick={() => { setCameraTarget("list"); setCamera(true); }}>
              <Camera className="h-4 w-4" /> Scan barcode
            </button>
            <button type="button" className="btn-primary" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Tambah produk
            </button>
          </div>
        </div>
        {/* Mobile: card list */}
        <div className="space-y-3 lg:hidden">
          {filtered.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">Belum ada produk.</div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="card p-4">
                <div className="flex gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-bg">
                    {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <Package className="h-6 w-6 text-subtle" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium leading-snug">{p.name}</p>
                      <span className={p.stock <= 0 ? "badge badge-danger" : p.stock <= p.minStock ? "badge badge-warning" : "badge badge-success"}>
                        {p.stock <= 0 ? "Habis" : p.stock <= p.minStock ? "Menipis" : "Aman"}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{p.category}</p>
                    <p className="mt-1 text-sm font-semibold text-accent tabular">{formatRupiah(p.sellPrice)}</p>
                    <p className="text-xs text-muted">Stok {p.stock} {p.unit || "pcs"}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" className="btn-ghost flex-1 py-2 text-xs" onClick={() => openEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn-ghost py-2 text-danger"
                    onClick={async () => {
                      if (!confirm("Hapus produk?")) return;
                      apply(await deleteProduct({ data: { id: p.id } }));
                      toast.success("Produk dihapus");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop: professional table */}
        <div className="table-wrap hidden lg:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-4 py-3 font-medium">Produk</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium text-right">Harga Modal</th>
                <th className="px-4 py-3 font-medium text-right">Harga Jual</th>
                <th className="px-4 py-3 font-medium text-right">Stok</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    Belum ada produk. Tambah produk untuk mulai.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/70">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-bg">
                          {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <Package className="h-4 w-4 text-subtle" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium">{p.name}</p>
                          <p className="font-mono text-[11px] text-subtle">{p.sku || p.barcode || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.category}</td>
                    <td className="px-4 py-3 text-right tabular">{formatRupiah(p.buyPrice)}</td>
                    <td className="px-4 py-3 text-right font-medium tabular text-accent">{formatRupiah(p.sellPrice)}</td>
                    <td className="px-4 py-3 text-right tabular">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock <= 0 ? "badge badge-danger" : p.stock <= p.minStock ? "badge badge-warning" : "badge badge-success"}>
                        {p.stock <= 0 ? "Habis" : p.stock <= p.minStock ? "Menipis" : "Aman"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" className="rounded-lg p-2 text-muted hover:bg-bg hover:text-fg" title="Edit" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-danger hover:bg-red-50"
                          title="Hapus"
                          onClick={async () => {
                            if (!confirm("Hapus produk?")) return;
                            apply(await deleteProduct({ data: { id: p.id } }));
                            toast.success("Produk dihapus");
                          }}
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
      </main>
      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit produk" : "Produk baru"} wide>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-elevated p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-bg">
                {form.image ? (
                  <img src={form.image} alt="Pratinjau produk" className="h-full w-full object-cover" />
                ) : (
                  <ImagePlus className="h-7 w-7 text-subtle" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Gambar produk</p>
                <p className="mt-0.5 text-xs text-muted">Tambahkan foto produk agar mudah dikenali di kasir.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <label className="btn-ghost cursor-pointer">
                    <ImagePlus className="h-4 w-4" /> Pilih gambar
                    <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleImage} />
                  </label>
                  {form.image ? (
                    <button type="button" className="btn-ghost text-danger" onClick={() => setForm({ ...form, image: "" })}>
                      <X className="h-4 w-4" /> Hapus
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input className="field col-span-2" placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="field" readOnly value={editId ? form.sku : "SKU otomatis"} />
            <div className="flex gap-2">
              <input className="field min-w-0 flex-1 font-mono" placeholder="Barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
              <button type="button" className="btn-ghost shrink-0" onClick={() => { setCameraTarget("form"); setCamera(true); }} title="Scan barcode dengan kamera">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>
          <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.filter((c) => c !== "Semua").map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            className="field"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          >
            <option value="pcs">pcs</option>
            <option value="dus">dus</option>
            <option value="pack">pack</option>
            <option value="kg">kg</option>
            <option value="liter">liter</option>
          </select>
          <MoneyInput placeholder="Harga beli / pcs" value={form.buyPrice} onChange={(buyPrice) => setForm({ ...form, buyPrice })} />
          <MoneyInput placeholder="Harga jual / pcs" value={form.sellPrice} onChange={(sellPrice) => setForm({ ...form, sellPrice })} />
          <input className="field" type="number" min={0} placeholder="Stok (pcs)" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          <input className="field" type="number" min={0} placeholder="Stok minimum (pcs)" value={form.minStock || ""} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} />
          <input className="field" type="number" min={1} placeholder="Isi 1 dus (pcs)" value={form.pcsPerDus || ""} onChange={(e) => setForm({ ...form, pcsPerDus: Math.max(1, Number(e.target.value) || 1) })} />
          <input className="field" type="number" min={0} placeholder="Stok dus" value={form.stockDus || ""} onChange={(e) => setForm({ ...form, stockDus: Number(e.target.value) })} />
          <MoneyInput placeholder="Harga beli / dus" value={form.buyPriceDus} onChange={(buyPriceDus) => setForm({ ...form, buyPriceDus })} />
          <MoneyInput placeholder="Harga jual / dus" value={form.sellPriceDus} onChange={(sellPriceDus) => setForm({ ...form, sellPriceDus })} />
          </div>
        </div>
        <button type="button" className="btn-primary mt-4 w-full" onClick={() => void save()}>
          Simpan
        </button>
      </Modal>
      {open && form.barcode.trim() ? (
        <p className={`px-4 text-sm lg:px-6 ${barcodeOwner ? "text-danger" : "text-success"}`}>
          {barcodeOwner
            ? `Barcode sudah digunakan oleh ${barcodeOwner.name} · ${barcodeOwner.sku} · stok ${formatNumber(barcodeOwner.stock)}`
            : "Barcode tersedia."}
        </p>
      ) : null}
      <Modal open={Boolean(duplicate)} onClose={() => setDuplicate(null)} title={duplicate && duplicate.barcode === form.barcode.trim() ? "Barcode sudah digunakan oleh produk ini." : "Produk sudah terdaftar."}>
        {duplicate ? (
          <div className="space-y-2 text-sm">
            <p>{duplicate.name}</p>
            <p className="font-mono">SKU {duplicate.sku}</p>
            <p className="font-mono">Barcode {duplicate.barcode || "-"}</p>
            <p>Stok {formatNumber(duplicate.stock)}</p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button type="button" className="btn-primary" onClick={() => { openEdit(duplicate); setDuplicate(null); }}>Gunakan Produk Ini</button>
              <button type="button" className="btn-ghost" onClick={() => setDuplicate(null)}>Batalkan</button>
            </div>
          </div>
        ) : null}
      </Modal>
      {camera ? (
        <BarcodeScanner
          onScan={(code) => {
            setCamera(false);
            if (cameraTarget === "form") {
              setForm((current) => ({ ...current, barcode: code }));
              toast.success(`Barcode ${code} berhasil dimasukkan`);
            } else {
              handleProductScan(code);
            }
          }}
          onClose={() => setCamera(false)}
        />
      ) : null}
    </>
  );
}
