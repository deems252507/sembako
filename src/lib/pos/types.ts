export type PaymentMethod = "tunai" | "qris" | "transfer" | "hutang";

export type StoreProfile = {
  userId: string;
  storeName: string;
  slogan: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  footerReceipt: string;
  logo: string | null;
  cashBalance: number;
};

export type Product = {
  id: string;
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
};

export type CartItem = {
  product: Product;
  qty: number;
  discount: number;
};

export type SaleItem = {
  productId: string;
  name: string;
  qty: number;
  price: number;
  buyPrice: number;
  discount: number;
};

export type Sale = {
  id: string;
  invoice: string;
  date: string;
  cashier: string;
  customerId: string | null;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  total: number;
  paymentMethod: Exclude<PaymentMethod, "hutang"> | "tunai";
  amountPaid: number;
  change: number;
  isDebt: boolean;
  status: "selesai" | "batal";
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  debtTotal: number;
  debtRemaining: number;
};

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  totalPurchase: number;
  debt: number;
};

export type PurchaseItem = {
  productId: string;
  name: string;
  qty: number;
  price: number;
};

export type Purchase = {
  id: string;
  date: string;
  supplierId: string | null;
  supplierName: string;
  total: number;
  status: "Lunas" | "Hutang";
  items: PurchaseItem[];
};

export type CashEntry = {
  id: string;
  date: string;
  note: string;
  kind: "masuk" | "keluar";
  amount: number;
};

export type Staff = {
  id: string;
  name: string;
  username: string;
  role: "Administrator" | "Kasir" | "Owner";
  isActive: boolean;
};

export type Shift = {
  id: string;
  openedAt: string;
  closedAt: string | null;
  initialCash: number;
  actualCash: number | null;
  status: "open" | "closed";
};

export type StockLog = {
  id: string;
  date: string;
  productId: string | null;
  productName: string;
  qtyBefore: number;
  qtyAfter: number;
  note: string;
};

export type StoreSnapshot = {
  profile: StoreProfile;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  purchases: Purchase[];
  sales: Sale[];
  cashEntries: CashEntry[];
  staff: Staff[];
  shifts: Shift[];
  stockLogs: StockLog[];
};

export const CATEGORIES = [
  "Semua",
  "Sembako",
  "Minuman",
  "Makanan",
  "Perawatan",
  "Lainnya",
] as const;
