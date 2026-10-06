import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const negative = n < 0;
  const [whole, fraction] = Math.abs(n).toString().split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const text = fraction ? `${grouped},${fraction}` : grouped;
  return negative ? `-${text}` : text;
}

export function formatCurrency(amount: number): string {
  const n = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `Rp${formatNumber(n)}`;
}

export function formatRupiah(amount: number): string {
  return formatCurrency(amount);
}

export function parseMoney(input: string): number {
  const digits = input.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function nid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function clearAccountCache(): void {
  if (typeof window === "undefined") return;
  const drop: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;
    if (
      key === "makmur-cart-v1" ||
      key === "cash_balance" ||
      key.startsWith("pos-cart:") ||
      key.startsWith("cash_balance_")
    ) {
      drop.push(key);
    }
  }
  for (const key of drop) window.localStorage.removeItem(key);
}
