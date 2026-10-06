-- SKU sequence and uniqueness. Does not replace product primary keys.
-- Existing product rows, sales, and purchases stay attached to the same id.

create table if not exists product_sku_counters (
  user_id text primary key,
  last_value integer not null default 0
);

alter table store_profiles alter column store_name set default '';
alter table store_profiles alter column slogan set default 'Kelola bisnis Anda dengan lebih mudah';

-- Unique SKU per account when SKU is filled. Skip if legacy duplicates exist
-- so this migration cannot fail a deploy that already has real data.
do $$
begin
  if not exists (
    select 1
    from products
    where sku is not null and btrim(sku) <> ''
    group by user_id, sku
    having count(*) > 1
  ) then
    create unique index if not exists products_user_sku_uidx
      on products (user_id, sku)
      where sku is not null and btrim(sku) <> '';
  end if;
end $$;

-- Barcode is optional. Empty barcode may repeat; a filled barcode may not.
do $$
begin
  if not exists (
    select 1
    from products
    where barcode is not null and btrim(barcode) <> ''
    group by user_id, barcode
    having count(*) > 1
  ) then
    create unique index if not exists products_user_barcode_uidx
      on products (user_id, barcode)
      where barcode is not null and btrim(barcode) <> '';
  end if;
end $$;
