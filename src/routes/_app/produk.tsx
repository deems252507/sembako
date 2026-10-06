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
  stock: number;
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
  stock: 0,
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
      unit: p.unit,
      buyPrice: p.buyPrice,
      sellPrice: p.sellPrice,
      stock: p.stock,
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
      <main className="space-y-4 p-4 lg:p-6">
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex gap-3">
                <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl bg-bg">
                  {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <Package className="h-6 w-6 text-subtle" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{p.name}</p>
                  <p className="font-mono text-xs text-subtle">{p.barcode || p.sku}</p>
                  <p className="mt-1 text-sm font-semibold text-accent tabular">{formatRupiah(p.sellPrice)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span>Stok {p.stock} {p.unit}</span>
                <span className={p.stock <= p.minStock ? "badge badge-warning" : "badge badge-success"}>
                  {p.stock <= p.minStock ? "Menipis" : "Aman"}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn-ghost flex-1" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button
                  type="button"
                  className="btn-ghost text-danger"
                  onClick={async () => {
                    if (!window.confirm("Hapus produk ini?")) return;
                    apply(await deleteProduct({ data: { id: p.id } }));
                    toast.success("Produk dihapus");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
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
          <input className="field" placeholder="Satuan" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <MoneyInput placeholder="Harga beli" value={form.buyPrice} onChange={(buyPrice) => setForm({ ...form, buyPrice })} />
          <MoneyInput placeholder="Harga jual" value={form.sellPrice} onChange={(sellPrice) => setForm({ ...form, sellPrice })} />
          <input className="field" type="number" placeholder="Stok" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            <input className="field" type="number" placeholder="Stok minimum" value={form.minStock || ""} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} />
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
