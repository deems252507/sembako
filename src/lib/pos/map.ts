import type {
  CashEntry,
  Customer,
  Product,
  Purchase,
  PurchaseItem,
  Sale,
  SaleItem,
  Shift,
  Staff,
  StockLog,
  StoreProfile,
  Supplier,
} from "./types";

export function num(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") return Number(v) || 0;
  if (typeof v === "bigint") return Number(v);
  return 0;
}

export function str(v: unknown): string {
  return v == null ? "" : String(v);
}

export function bool(v: unknown): boolean {
  return v === true || v === "t" || v === "true" || v === 1;
}

function parseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== "string" || !raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function mapProfile(row: Record<string, unknown>, userId: string): StoreProfile {
  return {
    userId,
    storeName: str(row.store_name) || "",
    slogan: str(row.slogan),
    address: str(row.address),
    phone: str(row.phone),
    whatsapp: str(row.whatsapp),
    email: str(row.email),
    footerReceipt: str(row.footer_receipt),
    logo: row.logo ? str(row.logo) : null,
    cashBalance: num(row.cash_balance),
  };
}

export function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: str(row.id),
    name: str(row.name),
    sku: str(row.sku),
    barcode: str(row.barcode),
    category: str(row.category) || "Sembako",
    unit: str(row.unit) || "pcs",
    buyPrice: num(row.buy_price),
    sellPrice: num(row.sell_price),
    stock: num(row.stock),
    minStock: num(row.min_stock),
    image: str(row.image),
    status: str(row.status) === "nonaktif" ? "nonaktif" : "aktif",
  };
}

export function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: str(row.id),
    name: str(row.name),
    phone: str(row.phone),
    totalSpent: num(row.total_spent),
    debtTotal: num(row.debt_total),
    debtRemaining: num(row.debt_remaining),
  };
}

export function mapSupplier(row: Record<string, unknown>): Supplier {
  return {
    id: str(row.id),
    name: str(row.name),
    phone: str(row.phone),
    totalPurchase: num(row.total_purchase),
    debt: num(row.debt),
  };
}

export function mapPurchase(row: Record<string, unknown>): Purchase {
  return {
    id: str(row.id),
    date: str(row.date).slice(0, 10),
    supplierId: row.supplier_id ? str(row.supplier_id) : null,
    supplierName: str(row.supplier_name),
    total: num(row.total),
    status: str(row.status) === "Hutang" ? "Hutang" : "Lunas",
    items: parseJson<PurchaseItem[]>(row.items, []),
  };
}

export function mapSale(row: Record<string, unknown>): Sale {
  return {
    id: str(row.id),
    invoice: str(row.invoice),
    date: str(row.date),
    cashier: str(row.cashier),
    customerId: row.customer_id ? str(row.customer_id) : null,
    customerName: str(row.customer_name) || "Umum",
    items: parseJson<SaleItem[]>(row.items, []),
    subtotal: num(row.subtotal),
    total: num(row.total),
    paymentMethod:
      str(row.payment_method) === "qris"
        ? "qris"
        : str(row.payment_method) === "transfer"
          ? "transfer"
          : "tunai",
    amountPaid: num(row.amount_paid),
    change: num(row.change_amount),
    isDebt: bool(row.is_debt),
    status: str(row.status) === "batal" ? "batal" : "selesai",
  };
}

export function mapCash(row: Record<string, unknown>): CashEntry {
  return {
    id: str(row.id),
    date: str(row.date),
    note: str(row.note),
    kind: str(row.kind) === "keluar" ? "keluar" : "masuk",
    amount: num(row.amount),
  };
}

export function mapStaff(row: Record<string, unknown>): Staff {
  const role = str(row.role);
  return {
    id: str(row.id),
    name: str(row.name),
    username: str(row.username),
    role:
      role === "Kasir" ? "Kasir" : role === "Owner" ? "Owner" : "Administrator",
    isActive: bool(row.is_active),
  };
}

export function mapShift(row: Record<string, unknown>): Shift {
  return {
    id: str(row.id),
    openedAt: str(row.opened_at),
    closedAt: row.closed_at ? str(row.closed_at) : null,
    initialCash: num(row.initial_cash),
    actualCash: row.actual_cash == null ? null : num(row.actual_cash),
    status: str(row.status) === "closed" ? "closed" : "open",
  };
}

export function mapStockLog(row: Record<string, unknown>): StockLog {
  return {
    id: str(row.id),
    date: str(row.date),
    productId: row.product_id ? str(row.product_id) : null,
    productName: str(row.product_name),
    qtyBefore: num(row.qty_before),
    qtyAfter: num(row.qty_after),
    note: str(row.note),
  };
}
