export interface StoreSettings {
  id: string;
  store_name: string;
  logo: string | null;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  slogan: string;
  footer_receipt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: "OWNER" | "ADMIN" | "KASIR";
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  unit: string;
  buy_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
  image?: string;
  status: "aktif" | "nonaktif";
  description?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
  discount: number;
  note?: string;
}

export interface Transaction {
  id: string;
  invoice: string;
  date: string;
  cashier: string;
  customer?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  payment_method: "tunai" | "qris" | "transfer";
  amount_paid: number;
  change: number;
  status: "selesai" | "batal";
}

export interface DashboardStats {
  omzet_hari_ini: number;
  omzet_change: number;
  total_transaksi: number;
  transaksi_change: number;
  laba_kotor: number;
  laba_change: number;
  kas_tersedia: number;
  piutang: number;
  hutang_supplier: number;
}
