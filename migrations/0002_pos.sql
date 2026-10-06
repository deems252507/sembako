-- Warung Makmur POS schema (per-user store)

create table if not exists store_profiles (
  user_id         text primary key,
  store_name      text not null default 'Warung Makmur',
  slogan          text not null default 'Kasir warung yang rapi',
  address         text not null default '',
  phone           text not null default '',
  whatsapp        text not null default '',
  email           text not null default '',
  footer_receipt  text not null default 'Terima kasih telah berbelanja!',
  logo            text,
  cash_balance    integer not null default 0,
  created_at      timestamptz not null default now()
);

create table if not exists products (
  id          text primary key,
  user_id     text not null,
  name        text not null,
  sku         text not null,
  barcode     text,
  category    text not null default 'Sembako',
  unit        text not null default 'pcs',
  buy_price   integer not null default 0,
  sell_price  integer not null default 0,
  stock       integer not null default 0,
  min_stock   integer not null default 5,
  image       text,
  status      text not null default 'aktif',
  created_at  timestamptz not null default now()
);
create index if not exists products_user_id_idx on products (user_id);

create table if not exists customers (
  id              text primary key,
  user_id         text not null,
  name            text not null,
  phone           text not null default '',
  total_spent     integer not null default 0,
  debt_total      integer not null default 0,
  debt_remaining  integer not null default 0
);
create index if not exists customers_user_id_idx on customers (user_id);

create table if not exists suppliers (
  id              text primary key,
  user_id         text not null,
  name            text not null,
  phone           text not null default '',
  total_purchase  integer not null default 0,
  debt            integer not null default 0
);
create index if not exists suppliers_user_id_idx on suppliers (user_id);

create table if not exists purchases (
  id             text primary key,
  user_id        text not null,
  date           date not null default current_date,
  supplier_id    text,
  supplier_name  text not null,
  total          integer not null,
  status         text not null,
  items          text not null,
  created_at     timestamptz not null default now()
);
create index if not exists purchases_user_id_idx on purchases (user_id);

create table if not exists sales (
  id              text primary key,
  user_id         text not null,
  invoice         text not null,
  date            timestamptz not null default now(),
  cashier         text not null,
  customer_id     text,
  customer_name   text not null default 'Umum',
  items           text not null,
  subtotal        integer not null,
  total           integer not null,
  payment_method  text not null,
  amount_paid     integer not null,
  change_amount   integer not null,
  is_debt         boolean not null default false,
  status          text not null default 'selesai'
);
create index if not exists sales_user_id_idx on sales (user_id);

create table if not exists cash_entries (
  id      text primary key,
  user_id text not null,
  date    timestamptz not null default now(),
  note    text not null,
  kind    text not null,
  amount  integer not null
);
create index if not exists cash_entries_user_id_idx on cash_entries (user_id);

create table if not exists staff (
  id         text primary key,
  user_id    text not null,
  name       text not null,
  username   text not null,
  role       text not null,
  is_active  boolean not null default true
);
create index if not exists staff_user_id_idx on staff (user_id);

create table if not exists shifts (
  id            text primary key,
  user_id       text not null,
  opened_at     timestamptz not null default now(),
  closed_at     timestamptz,
  initial_cash  integer not null,
  actual_cash   integer,
  status        text not null default 'open'
);
create index if not exists shifts_user_id_idx on shifts (user_id);

create table if not exists stock_logs (
  id            text primary key,
  user_id       text not null,
  date          timestamptz not null default now(),
  product_id    text,
  product_name  text not null,
  qty_before    integer not null,
  qty_after     integer not null,
  note          text not null
);
create index if not exists stock_logs_user_id_idx on stock_logs (user_id);
