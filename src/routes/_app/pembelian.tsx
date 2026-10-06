import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { createPurchase, deletePurchase } from "@/lib/pos/actions";
import { usePosStore } from "@/lib/pos/store";
import type { Purchase, PurchaseItem } from "@/lib/pos/types";
import { formatRupiah } from "@/lib/utils";

export const Route = createFileRoute("/_app/pembelian")({ component: PembelianPage });

function PembelianPage() {
  const purchases = usePosStore((s) => s.purchases);
  const suppliers = usePosStore((s) => s.suppliers);
  const products = usePosStore((s) => s.products);
  const apply = usePosStore((s) => s.apply);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<Purchase | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Purchase | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState<"Lunas" | "Hutang">("Lunas");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState(1);
  const [items, setItems] = useState<PurchaseItem[]>([]);

  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const supplier = suppliers.find((s) => s.id === supplierId);

  const sorted = useMemo(
    () => [...purchases].sort((a, b) => b.date.localeCompare(a.date)),
    [purchases],
  );

  const addItem = () => {
    const p = products.find((x) => x.id === selectedProduct);
    if (!p) return;
    setItems((cur) => {
      const existing = cur.find((i) => i.productId === p.id);
      if (existing) {
        return cur.map((i) => (i.productId === p.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...cur, { productId: p.id, name: p.name, qty, price: p.buyPrice }];
    });
    setSelectedProduct("");
    setQty(1);
  };

  const save = async () => {
    if (!supplier || items.length === 0) {
      toast.error("Pilih supplier dan tambahkan barang");
      return;
    }
    try {
      const snap = await createPurchase({
        data: {
          supplierId: supplier.id,
          supplierName: supplier.name,
          status,
          items,
        },
      });
      apply(snap);
      setShowForm(false);
      setItems([]);
      setSupplierId("");
      toast.success("Pembelian tersimpan. Stok otomatis bertambah.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const snap = await deletePurchase({ data: { id: pendingDelete.id } });
      apply(snap);
      setPendingDelete(null);
      setDetail(null);
      toast.success("Pembelian dihapus. Stok dan hutang sudah dibalik.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader title="Pembelian" subtitle="Daftar pembelian bisa dihapus — stok ikut dikoreksi" />
      <main className="space-y-4 p-4 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Daftar pembelian</h2>
            <p className="text-sm text-muted">{purchases.length} transaksi masuk gudang</p>
          </div>
          <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Pembelian baru
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg text-left text-muted">
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted">
                      Belum ada pembelian
                    </td>
                  </tr>
                ) : (
                  sorted.map((p) => (
                    <tr key={p.id} className="border-b border-border/70">
                      <td className="px-4 py-3">{p.date}</td>
                      <td className="px-4 py-3 font-medium">{p.supplierName}</td>
                      <td className="px-4 py-3 text-muted">{p.items.length} barang</td>
                      <td className="px-4 py-3 tabular">{formatRupiah(p.total)}</td>
                      <td className="px-4 py-3">
                        <span className={p.status === "Lunas" ? "badge badge-success" : "badge badge-danger"}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="rounded-lg p-2 hover:bg-bg"
                            onClick={() => setDetail(p)}
                            aria-label="Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-danger hover:bg-danger/8"
                            onClick={() => setPendingDelete(p)}
                            aria-label="Hapus pembelian"
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

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Detail pembelian" wide>
        {detail ? (
          <div className="space-y-3 text-sm">
            <Row label="Tanggal" value={detail.date} />
            <Row label="Supplier" value={detail.supplierName} />
            <Row label="Status" value={detail.status} />
            <div className="divide-y divide-border rounded-xl bg-bg">
              {detail.items.map((item) => (
                <div key={item.productId} className="flex justify-between px-3 py-2">
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span className="tabular">{formatRupiah(item.qty * item.price)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-accent tabular">{formatRupiah(detail.total)}</span>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" className="btn-ghost flex-1" onClick={() => setDetail(null)}>
                Tutup
              </button>
              <button
                type="button"
                className="btn-primary flex-1 bg-danger"
                onClick={() => setPendingDelete(detail)}
              >
                Hapus pembelian
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} title="Hapus pembelian?">
        {pendingDelete ? (
          <div className="space-y-4 text-sm">
            <p>
              Hapus pembelian dari <span className="font-semibold">{pendingDelete.supplierName}</span> senilai{" "}
              <span className="font-semibold tabular">{formatRupiah(pendingDelete.total)}</span>?
            </p>
            <ul className="list-disc space-y-1 pl-4 text-muted">
              <li>Stok barang pada nota ini akan dikurangi.</li>
              {pendingDelete.status === "Hutang" ? (
                <li>Hutang supplier akan dibatalkan.</li>
              ) : (
                <li>Kas akan dikembalikan (pembelian tunai dibatalkan).</li>
              )}
              <li>Tindakan ini tidak bisa dibatalkan.</li>
            </ul>
            <div className="flex gap-2">
              <button type="button" className="btn-ghost flex-1" onClick={() => setPendingDelete(null)}>
                Batal
              </button>
              <button
                type="button"
                className="btn-primary flex-1 bg-danger"
                disabled={deleting}
                onClick={() => void confirmDelete()}
              >
                {deleting ? "Menghapus…" : "Ya, hapus"}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Pembelian baru" wide>
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Supplier</span>
            <select className="field" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">Pilih supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Status</span>
            <select
              className="field"
              value={status}
              onChange={(e) => setStatus(e.target.value as "Lunas" | "Hutang")}
            >
              <option value="Lunas">Lunas</option>
              <option value="Hutang">Hutang</option>
            </select>
          </label>
          <div className="flex gap-2">
            <select
              className="field flex-1"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Pilih produk</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              className="field w-20"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 1)}
            />
            <button type="button" className="btn-primary px-4" onClick={addItem}>
              Tambah
            </button>
          </div>
          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2 text-sm">
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="tabular">{formatRupiah(item.qty * item.price)}</span>
                    <button
                      type="button"
                      className="text-danger"
                      onClick={() => setItems(items.filter((i) => i.productId !== item.productId))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-accent tabular">{formatRupiah(total)}</span>
              </div>
            </div>
          ) : null}
          <button type="button" className="btn-primary w-full" onClick={() => void save()}>
            Simpan pembelian
          </button>
        </div>
      </Modal>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
