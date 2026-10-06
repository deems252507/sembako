export function formatSku(value: number): string {
  const n = Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
  return `SKU-${String(n).padStart(6, "0")}`;
}

export function normalizeCode(value: string): string {
  return value.trim();
}

export type IdentityProduct = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  stock: number;
};

export function findByExactBarcode<T extends { id: string; barcode: string }>(
  products: T[],
  code: string,
  exceptId?: string | null,
): T | null {
  const value = normalizeCode(code);
  if (!value) return null;
  return products.find((p) => p.id !== exceptId && p.barcode === value) ?? null;
}

export function findByExactSku<T extends { id: string; sku: string }>(
  products: T[],
  sku: string,
  exceptId?: string | null,
): T | null {
  const value = normalizeCode(sku);
  if (!value) return null;
  return products.find((p) => p.id !== exceptId && p.sku === value) ?? null;
}

export function findByExactName<T extends { id: string; name: string }>(
  products: T[],
  name: string,
  exceptId?: string | null,
): T | null {
  const value = normalizeCode(name).toLowerCase();
  if (!value) return null;
  return products.find((p) => p.id !== exceptId && p.name.trim().toLowerCase() === value) ?? null;
}
