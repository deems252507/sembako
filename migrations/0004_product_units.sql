-- Dual unit pricing: stock is always base pcs; dus has conversion + own sell price
alter table products add column if not exists pcs_per_dus integer not null default 1;
alter table products add column if not exists sell_price_dus integer not null default 0;
alter table products add column if not exists buy_price_dus integer not null default 0;
alter table products add column if not exists stock_dus integer not null default 0;
