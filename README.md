# Warung Sembako - POS & Manajemen Warung

Aplikasi web profesional untuk mengelola warung sembako: POS Kasir, Produk, Stok, Pembelian, Supplier, Pelanggan, Hutang/Piutang, Keuangan, Laporan, Shift Kasir, dan Pengaturan Toko.

Desain mengikuti referensi UI yang diberikan (hijau tua sidebar, card modern, layout 2 kolom kasir, dll).

## Fitur yang Sudah Ada (UI)

- Dashboard dengan 4 card statistik + grafik penjualan 7 hari + produk terlaris
- Kasir POS layout desktop 2 kolom + mobile bottom sheet
- Sidebar navigasi lengkap sesuai menu referensi
- Header dengan search, notifikasi, avatar user
- Responsive layout

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Lucide React (icons)
- Recharts (grafik)
- Prisma + PostgreSQL (Neon.com)
- Deploy target: Vercel

## Cara Deploy ke Vercel + Neon

### 1. Database Neon

1. Daftar / login di https://console.neon.tech
2. Create Project
3. Copy Connection String (format: `postgresql://...@ep-....neon.tech/neondb?sslmode=require`)

### 2. Siapkan Source

```bash
unzip warung-sembako.zip
cd warung-sembako
npm install
```

### 3. Environment Variable

Buat `.env.local`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
```

### 4. Database Schema

```bash
npx prisma db push
npx prisma generate
```

### 5. Deploy Vercel

**Cara mudah:**

1. Push folder ini ke GitHub repo
2. Masuk ke https://vercel.com → Add New Project → Import repo
3. Di Environment Variables, tambahkan:
   - Key: `DATABASE_URL`
   - Value: connection string Neon
4. Deploy

**Atau CLI:**

```bash
npm i -g vercel
vercel
# ikuti prompt, set DATABASE_URL
```

### 6. Development Lokal

```bash
npm run dev
```

Buka http://localhost:3000 → otomatis redirect ke /dashboard

## Struktur

```
src/
  app/
    (dashboard)/
      dashboard/page.tsx   ← Dashboard sesuai referensi
      kasir/page.tsx       ← Kasir 2 kolom
      produk/ ...          ← siap dikembangkan
      layout.tsx           ← Sidebar + content
    layout.tsx
    page.tsx               ← redirect
  components/
    Sidebar.tsx
    Header.tsx
  lib/
    utils.ts               ← formatRupiah, cn
    mock-data.ts           ← data contoh
  types/
prisma/
  schema.prisma            ← schema lengkap (users, products, transactions, debts, shifts, dll)
```

## Catatan Penting

- Semua data toko (nama, alamat, HP, logo) harus diambil dari tabel `StoreSettings`, jangan hardcode.
- Format uang: Rp 3.250.000 (gunakan `formatRupiah`)
- Role: OWNER, ADMIN, KASIR
- Saat ini menggunakan mock data agar UI langsung terlihat. Integrasikan Prisma + Server Actions untuk data real.

## Langkah Selanjutnya (Prioritas)

1. Login page + NextAuth / custom JWT
2. CRUD Produk (dengan upload gambar)
3. Transaksi Kasir → simpan ke DB + kurangi stok
4. Struk print/preview
5. Modul lain sesuai PHASE di prompt

---

**Kelola Warung, Lebih Mudah.**
**Warung Anda, Lebih Maju!**
