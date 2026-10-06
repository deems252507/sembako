import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { deleteProduct, upsertProduct } from "@/lib/pos/actions";
import { usePosStore } from "@/lib/pos/store";
import { CATEGORIES, type Product } from "@/lib/pos/types";
import { formatRupiah } from "@/lib/utils";

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

  const save = async () => {
    if (!form.name || !form.sku) return toast.error("Nama dan SKU wajib");
    const snap = await upsertProduct({ data: { ...form, id: editId ?? undefined } });
    apply(snap);
    setOpen(false);
    toast.success("Produk disimpan");
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
          <button type="button" className="btn-primary" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Tambah produk
          </button>
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
        <div className="grid grid-cols-2 gap-3">
          <input className="field col-span-2" placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="field" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <input className="field" placeholder="Barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
          <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.filter((c) => c !== "Semua").map((c) => <option key={c}>{c}</option>)}
          </select>
          <input className="field" placeholder="Satuan" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <input className="field" type="number" placeholder="Harga beli" value={form.buyPrice || ""} onChange={(e) => setForm({ ...form, buyPrice: Number(e.target.value) })} />
          <input className="field" type="number" placeholder="Harga jual" value={form.sellPrice || ""} onChange={(e) => setForm({ ...form, sellPrice: Number(e.target.value) })} />
          <input className="field" type="number" placeholder="Stok" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          <input className="field" type="number" placeholder="Stok minimum" value={form.minStock || ""} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} />
        </div>
        <button type="button" className="btn-primary mt-4 w-full" onClick={() => void save()}>
          Simpan
        </button>
      </Modal>
    </>
  );
}
