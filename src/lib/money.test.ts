import assert from "node:assert/strict";
import test from "node:test";
import { formatCurrency, formatNumber, formatRupiah, parseMoney } from "./utils.ts";
import { findByExactBarcode, formatSku } from "./pos/identity.ts";

test("indonesian number format uses dot thousands and keeps raw values numeric", () => {
  assert.equal(formatNumber(1000), "1.000");
  assert.equal(formatNumber(15000), "15.000");
  assert.equal(formatNumber(250000), "250.000");
  assert.equal(formatNumber(2480000), "2.480.000");
  assert.equal(formatNumber(10000000), "10.000.000");
  assert.equal(formatNumber(15328000), "15.328.000");
  assert.equal(formatCurrency(15000), "Rp15.000");
  assert.equal(formatCurrency(2480000), "Rp2.480.000");
  assert.equal(formatRupiah(15328000), "Rp15.328.000");
  assert.equal(parseMoney("15.000"), 15000);
  assert.equal(parseMoney("Rp2.480.000"), 2480000);
});

test("sku and barcode are not thousand-formatted", () => {
  assert.equal(formatSku(1), "SKU-000001");
  assert.equal(formatSku(125), "SKU-000125");
  assert.equal(findByExactBarcode(
    [{ id: "a", barcode: "8991234567890" }],
    "8991234567890",
  )?.id, "a");
  assert.equal(findByExactBarcode(
    [{ id: "a", barcode: "8991234567890" }],
    "899123456789",
  ), null);
});
