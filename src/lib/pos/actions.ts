import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { nid } from "@/lib/utils";
import {
  mapCash,
  mapCustomer,
  mapProduct,
  mapProfile,
  mapPurchase,
  mapSale,
  mapShift,
  mapStaff,
  mapStockLog,
  mapSupplier,
} from "./map";
import {
  SEED_CUSTOMERS,
  SEED_PRODUCTS,
  SEED_PURCHASES,
  SEED_STAFF,
  SEED_SUPPLIERS,
} from "./seed";
import type {
  PurchaseItem,
  SaleItem,
  StoreSnapshot,
} from "./types";

function invoiceNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${date}-${seq}`;
}

async function loadSnapshot(userId: string): Promise<StoreSnapshot> {
  const sql = await getSql();
  const [
    profiles,
    products,
    customers,
    suppliers,
    purchases,
    sales,
    cashEntries,
    staff,
    shifts,
    stockLogs,
  ] = await Promise.all([
    sql<Record<string, unknown>>`select * from store_profiles where user_id = ${userId}`,
    sql<Record<string, unknown>>`select * from products where user_id = ${userId} order by name`,
    sql<Record<string, unknown>>`select * from customers where user_id = ${userId} order by name`,
    sql<Record<string, unknown>>`select * from suppliers where user_id = ${userId} order by name`,
    sql<Record<string, unknown>>`select * from purchases where user_id = ${userId} order by date desc, created_at desc`,
    sql<Record<string, unknown>>`select * from sales where user_id = ${userId} order by date desc`,
    sql<Record<string, unknown>>`select * from cash_entries where user_id = ${userId} order by date desc`,
    sql<Record<string, unknown>>`select * from staff where user_id = ${userId} order by name`,
    sql<Record<string, unknown>>`select * from shifts where user_id = ${userId} order by opened_at desc`,
    sql<Record<string, unknown>>`select * from stock_logs where user_id = ${userId} order by date desc limit 80`,
  ]);

  const profileRow = profiles[0];
  return {
    profile: profileRow
      ? mapProfile(profileRow, userId)
      : {
          userId,
          storeName: "",
          slogan: "Kelola bisnis Anda dengan lebih mudah",
          address: "",
          phone: "",
          whatsapp: "",
          email: "",
          footerReceipt: "Terima kasih telah berbelanja!",
          logo: null,
          cashBalance: 0,
        },
    products: products.map(mapProduct),
    customers: customers.map(mapCustomer),
    suppliers: suppliers.map(mapSupplier),
    purchases: purchases.map(mapPurchase),
    sales: sales.map(mapSale),
    cashEntries: cashEntries.map(mapCash),
    staff: staff.map(mapStaff),
    shifts: shifts.map(mapShift),
    stockLogs: stockLogs.map(mapStockLog),
  };
}

async function seedIfNeeded(userId: string): Promise<void> {
  const sql = await getSql();
  const existing = await sql<{ user_id: string }>`
    select user_id from store_profiles where user_id = ${userId}
  `;
  if (existing.length > 0) return;

  await sql`
    insert into store_profiles (
      user_id, store_name, slogan, address, phone, whatsapp, email, footer_receipt, cash_balance
    ) values (
      ${userId},
      ${""},
      ${"Kelola bisnis Anda dengan lebih mudah"},
      ${""},
      ${""},
      ${""},
      ${""},
      ${"Terima kasih telah berbelanja!"},
      ${2480000}
    )
  `;

  for (const p of SEED_PRODUCTS) {
    await sql`
      insert into products (
        id, user_id, name, sku, barcode, category, unit, buy_price, sell_price, stock, min_stock, image, status
      ) values (
        ${p.id}, ${userId}, ${p.name}, ${p.sku}, ${p.barcode}, ${p.category}, ${p.unit},
        ${p.buyPrice}, ${p.sellPrice}, ${p.stock}, ${p.minStock}, ${p.image}, ${p.status}
      )
    `;
  }
  for (const c of SEED_CUSTOMERS) {
    await sql`
      insert into customers (id, user_id, name, phone, total_spent, debt_total, debt_remaining)
      values (${c.id}, ${userId}, ${c.name}, ${c.phone}, ${c.totalSpent}, ${c.debtTotal}, ${c.debtRemaining})
    `;
  }
  for (const s of SEED_SUPPLIERS) {
    await sql`
      insert into suppliers (id, user_id, name, phone, total_purchase, debt)
      values (${s.id}, ${userId}, ${s.name}, ${s.phone}, ${s.totalPurchase}, ${s.debt})
    `;
  }
  for (const p of SEED_PURCHASES) {
    await sql`
      insert into purchases (id, user_id, date, supplier_id, supplier_name, total, status, items)
      values (
        ${p.id}, ${userId}, ${p.date}::date, ${p.supplierId}, ${p.supplierName},
        ${p.total}, ${p.status}, ${JSON.stringify(p.items)}
      )
    `;
  }
  for (const s of SEED_STAFF) {
    await sql`
      insert into staff (id, user_id, name, username, role, is_active)
      values (${s.id}, ${userId}, ${s.name}, ${s.username}, ${s.role}, ${s.isActive})
    `;
  }

  await sql`
    insert into cash_entries (id, user_id, date, note, kind, amount)
    values
      (${nid()}, ${userId}, ${"2026-10-01T08:00:00+08:00"}::timestamptz, ${"Penjualan tunai"}, ${"masuk"}, ${530000}),
      (${nid()}, ${userId}, ${"2026-10-01T09:00:00+08:00"}::timestamptz, ${"Pembelian barang"}, ${"keluar"}, ${1250000}),
      (${nid()}, ${userId}, ${"2026-10-01T10:00:00+08:00"}::timestamptz, ${"Biaya operasional"}, ${"keluar"}, ${55000}),
      (${nid()}, ${userId}, ${"2026-09-30T16:00:00+08:00"}::timestamptz, ${"Bayar hutang pelanggan"}, ${"masuk"}, ${120000})
  `;

  await sql`
    insert into shifts (id, user_id, opened_at, initial_cash, status)
    values (${nid()}, ${userId}, ${"2026-10-01T07:00:00+08:00"}::timestamptz, ${500000}, ${"open"})
  `;
}

export const loadStore = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await seedIfNeeded(context.userId);
    return loadSnapshot(context.userId);
  });

const productInput = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional().default(""),
  category: z.string().min(1),
  unit: z.string().min(1),
  buyPrice: z.number(),
  sellPrice: z.number(),
  stock: z.number(),
  minStock: z.number(),
  image: z.string().optional().default(""),
  status: z.enum(["aktif", "nonaktif"]).optional().default("aktif"),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(productInput)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = data.id || nid();
    if (data.id) {
      await sql`
        update products set
          name = ${data.name}, sku = ${data.sku}, barcode = ${data.barcode},
          category = ${data.category}, unit = ${data.unit},
          buy_price = ${data.buyPrice}, sell_price = ${data.sellPrice},
          stock = ${data.stock}, min_stock = ${data.minStock},
          image = ${data.image}, status = ${data.status}
        where id = ${id} and user_id = ${context.userId}
      `;
    } else {
      await sql`
        insert into products (
          id, user_id, name, sku, barcode, category, unit, buy_price, sell_price, stock, min_stock, image, status
        ) values (
          ${id}, ${context.userId}, ${data.name}, ${data.sku}, ${data.barcode},
          ${data.category}, ${data.unit}, ${data.buyPrice}, ${data.sellPrice},
          ${data.stock}, ${data.minStock}, ${data.image}, ${data.status}
        )
      `;
    }
    return loadSnapshot(context.userId);
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from products where id = ${data.id} and user_id = ${context.userId}`;
    return loadSnapshot(context.userId);
  });

export const adjustStock = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), stock: z.number().min(0), note: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select * from products where id = ${data.id} and user_id = ${context.userId}
    `;
    const product = rows[0];
    if (!product) throw new Error("Produk tidak ditemukan");
    const before = Number(product.stock) || 0;
    await sql`
      update products set stock = ${data.stock}
      where id = ${data.id} and user_id = ${context.userId}
    `;
    await sql`
      insert into stock_logs (id, user_id, product_id, product_name, qty_before, qty_after, note)
      values (${nid()}, ${context.userId}, ${data.id}, ${String(product.name)}, ${before}, ${data.stock}, ${data.note})
    `;
    return loadSnapshot(context.userId);
  });

const purchaseItem = z.object({
  productId: z.string(),
  name: z.string(),
  qty: z.number().min(1),
  price: z.number().min(0),
});

export const createPurchase = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      supplierId: z.string().nullable(),
      supplierName: z.string().min(1),
      status: z.enum(["Lunas", "Hutang"]),
      items: z.array(purchaseItem).min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const total = data.items.reduce((s, i) => s + i.qty * i.price, 0);
    const id = nid();
    await sql`
      insert into purchases (id, user_id, date, supplier_id, supplier_name, total, status, items)
      values (
        ${id}, ${context.userId}, current_date, ${data.supplierId}, ${data.supplierName},
        ${total}, ${data.status}, ${JSON.stringify(data.items satisfies PurchaseItem[])}
      )
    `;
    for (const item of data.items) {
      await sql`
        update products set stock = stock + ${item.qty}
        where id = ${item.productId} and user_id = ${context.userId}
      `;
    }
    if (data.supplierId) {
      if (data.status === "Hutang") {
        await sql`
          update suppliers
          set total_purchase = total_purchase + ${total}, debt = debt + ${total}
          where id = ${data.supplierId} and user_id = ${context.userId}
        `;
      } else {
        await sql`
          update suppliers set total_purchase = total_purchase + ${total}
          where id = ${data.supplierId} and user_id = ${context.userId}
        `;
        await sql`
          update store_profiles set cash_balance = cash_balance - ${total}
          where user_id = ${context.userId}
        `;
        await sql`
          insert into cash_entries (id, user_id, note, kind, amount)
          values (${nid()}, ${context.userId}, ${"Pembelian " + data.supplierName}, ${"keluar"}, ${total})
        `;
      }
    }
    return loadSnapshot(context.userId);
  });

export const deletePurchase = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select * from purchases where id = ${data.id} and user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) throw new Error("Pembelian tidak ditemukan");
    const purchase = mapPurchase(row);

    for (const item of purchase.items) {
      await sql`
        update products
        set stock = greatest(0, stock - ${item.qty})
        where id = ${item.productId} and user_id = ${context.userId}
      `;
    }

    if (purchase.supplierId) {
      if (purchase.status === "Hutang") {
        await sql`
          update suppliers
          set total_purchase = greatest(0, total_purchase - ${purchase.total}),
              debt = greatest(0, debt - ${purchase.total})
          where id = ${purchase.supplierId} and user_id = ${context.userId}
        `;
      } else {
        await sql`
          update suppliers
          set total_purchase = greatest(0, total_purchase - ${purchase.total})
          where id = ${purchase.supplierId} and user_id = ${context.userId}
        `;
        await sql`
          update store_profiles set cash_balance = cash_balance + ${purchase.total}
          where user_id = ${context.userId}
        `;
        await sql`
          insert into cash_entries (id, user_id, note, kind, amount)
          values (
            ${nid()}, ${context.userId},
            ${"Pembatalan pembelian " + purchase.supplierName},
            ${"masuk"}, ${purchase.total}
          )
        `;
      }
    }

    await sql`delete from purchases where id = ${data.id} and user_id = ${context.userId}`;
    return loadSnapshot(context.userId);
  });

const saleItem = z.object({
  productId: z.string(),
  name: z.string(),
  qty: z.number().min(1),
  price: z.number().min(0),
  buyPrice: z.number(),
  discount: z.number().default(0),
});

export const checkoutSale = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      cashier: z.string(),
      customerId: z.string().nullable(),
      customerName: z.string(),
      paymentMethod: z.enum(["tunai", "qris", "transfer", "hutang"]),
      amountPaid: z.number(),
      items: z.array(saleItem).min(1),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const subtotal = data.items.reduce((s, i) => s + i.price * i.qty - i.discount, 0);
    const total = subtotal;
    const isDebt = data.paymentMethod === "hutang";
    if (data.paymentMethod === "tunai" && data.amountPaid < total) {
      throw new Error("Uang tidak cukup");
    }
    if (isDebt && !data.customerId) {
      throw new Error("Pilih pelanggan untuk bon");
    }

    const id = nid();
    const invoice = invoiceNo();
    const method = isDebt ? "tunai" : data.paymentMethod;
    const paid = isDebt ? 0 : data.paymentMethod === "tunai" ? data.amountPaid : total;
    const change = isDebt ? 0 : Math.max(0, paid - total);

    await sql`
      insert into sales (
        id, user_id, invoice, cashier, customer_id, customer_name, items,
        subtotal, total, payment_method, amount_paid, change_amount, is_debt, status
      ) values (
        ${id}, ${context.userId}, ${invoice}, ${data.cashier}, ${data.customerId},
        ${data.customerName}, ${JSON.stringify(data.items satisfies SaleItem[])},
        ${subtotal}, ${total}, ${method}, ${paid}, ${change}, ${isDebt}, ${"selesai"}
      )
    `;

    for (const item of data.items) {
      await sql`
        update products
        set stock = greatest(0, stock - ${item.qty})
        where id = ${item.productId} and user_id = ${context.userId}
      `;
    }

    if (isDebt && data.customerId) {
      await sql`
        update customers
        set total_spent = total_spent + ${total},
            debt_total = debt_total + ${total},
            debt_remaining = debt_remaining + ${total}
        where id = ${data.customerId} and user_id = ${context.userId}
      `;
    } else if (data.customerId) {
      await sql`
        update customers set total_spent = total_spent + ${total}
        where id = ${data.customerId} and user_id = ${context.userId}
      `;
    }

    if (!isDebt && data.paymentMethod === "tunai") {
      await sql`
        update store_profiles set cash_balance = cash_balance + ${total}
        where user_id = ${context.userId}
      `;
      await sql`
        insert into cash_entries (id, user_id, note, kind, amount)
        values (${nid()}, ${context.userId}, ${"Penjualan " + invoice}, ${"masuk"}, ${total})
      `;
    }

    const snap = await loadSnapshot(context.userId);
    const sale = snap.sales.find((s) => s.id === id) ?? null;
    return { snapshot: snap, sale };
  });

export const deleteSale = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from sales where id = ${data.id} and user_id = ${context.userId}`;
    return loadSnapshot(context.userId);
  });

export const saveCustomer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      phone: z.string().optional().default(""),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.id) {
      await sql`
        update customers set name = ${data.name}, phone = ${data.phone}
        where id = ${data.id} and user_id = ${context.userId}
      `;
    } else {
      await sql`
        insert into customers (id, user_id, name, phone)
        values (${nid()}, ${context.userId}, ${data.name}, ${data.phone})
      `;
    }
    return loadSnapshot(context.userId);
  });

export const deleteCustomer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from customers where id = ${data.id} and user_id = ${context.userId}`;
    return loadSnapshot(context.userId);
  });

export const saveSupplier = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      phone: z.string().optional().default(""),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.id) {
      await sql`
        update suppliers set name = ${data.name}, phone = ${data.phone}
        where id = ${data.id} and user_id = ${context.userId}
      `;
    } else {
      await sql`
        insert into suppliers (id, user_id, name, phone)
        values (${nid()}, ${context.userId}, ${data.name}, ${data.phone})
      `;
    }
    return loadSnapshot(context.userId);
  });

export const deleteSupplier = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from suppliers where id = ${data.id} and user_id = ${context.userId}`;
    return loadSnapshot(context.userId);
  });

export const payCustomerDebt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), amount: z.number().positive() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select * from customers where id = ${data.id} and user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) throw new Error("Pelanggan tidak ditemukan");
    const remaining = Number(row.debt_remaining) || 0;
    if (data.amount > remaining) throw new Error("Nominal melebihi sisa hutang");
    await sql`
      update customers set debt_remaining = debt_remaining - ${data.amount}
      where id = ${data.id} and user_id = ${context.userId}
    `;
    await sql`
      update store_profiles set cash_balance = cash_balance + ${data.amount}
      where user_id = ${context.userId}
    `;
    await sql`
      insert into cash_entries (id, user_id, note, kind, amount)
      values (${nid()}, ${context.userId}, ${"Bayar hutang: " + String(row.name)}, ${"masuk"}, ${data.amount})
    `;
    return loadSnapshot(context.userId);
  });

export const paySupplierDebt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), amount: z.number().positive() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select * from suppliers where id = ${data.id} and user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) throw new Error("Supplier tidak ditemukan");
    const debt = Number(row.debt) || 0;
    if (data.amount > debt) throw new Error("Nominal melebihi sisa hutang");
    const profiles = await sql<{ cash_balance: unknown }>`
      select cash_balance from store_profiles where user_id = ${context.userId}
    `;
    const cash = Number(profiles[0]?.cash_balance) || 0;
    if (cash < data.amount) throw new Error("Saldo kas tidak cukup");
    await sql`
      update suppliers set debt = debt - ${data.amount}
      where id = ${data.id} and user_id = ${context.userId}
    `;
    await sql`
      update store_profiles set cash_balance = cash_balance - ${data.amount}
      where user_id = ${context.userId}
    `;
    await sql`
      insert into cash_entries (id, user_id, note, kind, amount)
      values (${nid()}, ${context.userId}, ${"Bayar supplier: " + String(row.name)}, ${"keluar"}, ${data.amount})
    `;
    return loadSnapshot(context.userId);
  });

export const addCashEntry = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      note: z.string().min(1),
      kind: z.enum(["masuk", "keluar"]),
      amount: z.number().positive(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      insert into cash_entries (id, user_id, note, kind, amount)
      values (${nid()}, ${context.userId}, ${data.note}, ${data.kind}, ${data.amount})
    `;
    if (data.kind === "masuk") {
      await sql`
        update store_profiles set cash_balance = cash_balance + ${data.amount}
        where user_id = ${context.userId}
      `;
    } else {
      await sql`
        update store_profiles set cash_balance = cash_balance - ${data.amount}
        where user_id = ${context.userId}
      `;
    }
    return loadSnapshot(context.userId);
  });

export const deleteCashEntry = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`
      select * from cash_entries where id = ${data.id} and user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) return loadSnapshot(context.userId);
    const amount = Number(row.amount) || 0;
    if (String(row.kind) === "masuk") {
      await sql`
        update store_profiles set cash_balance = cash_balance - ${amount}
        where user_id = ${context.userId}
      `;
    } else {
      await sql`
        update store_profiles set cash_balance = cash_balance + ${amount}
        where user_id = ${context.userId}
      `;
    }
    await sql`delete from cash_entries where id = ${data.id} and user_id = ${context.userId}`;
    return loadSnapshot(context.userId);
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      storeName: z.string().min(1),
      slogan: z.string(),
      address: z.string(),
      phone: z.string(),
      whatsapp: z.string(),
      email: z.string(),
      footerReceipt: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update store_profiles set
        store_name = ${data.storeName},
        slogan = ${data.slogan},
        address = ${data.address},
        phone = ${data.phone},
        whatsapp = ${data.whatsapp},
        email = ${data.email},
        footer_receipt = ${data.footerReceipt}
      where user_id = ${context.userId}
    `;
    return loadSnapshot(context.userId);
  });

export const saveStaff = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      username: z.string().min(1),
      role: z.enum(["Administrator", "Kasir", "Owner"]),
      isActive: z.boolean().optional().default(true),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.id) {
      await sql`
        update staff set name = ${data.name}, username = ${data.username}, role = ${data.role}, is_active = ${data.isActive}
        where id = ${data.id} and user_id = ${context.userId}
      `;
    } else {
      await sql`
        insert into staff (id, user_id, name, username, role, is_active)
        values (${nid()}, ${context.userId}, ${data.name}, ${data.username}, ${data.role}, ${data.isActive})
      `;
    }
    return loadSnapshot(context.userId);
  });

export const deleteStaff = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`delete from staff where id = ${data.id} and user_id = ${context.userId}`;
    return loadSnapshot(context.userId);
  });

export const openShift = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ initialCash: z.number().min(0) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update shifts set status = ${"closed"}, closed_at = now(), actual_cash = actual_cash
      where user_id = ${context.userId} and status = ${"open"}
    `;
    await sql`
      insert into shifts (id, user_id, initial_cash, status)
      values (${nid()}, ${context.userId}, ${data.initialCash}, ${"open"})
    `;
    await sql`
      update store_profiles set cash_balance = ${data.initialCash}
      where user_id = ${context.userId}
    `;
    return loadSnapshot(context.userId);
  });

export const closeShift = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), actualCash: z.number().min(0) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      update shifts
      set status = ${"closed"}, closed_at = now(), actual_cash = ${data.actualCash}
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return loadSnapshot(context.userId);
  });
