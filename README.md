# Warung Sembako POS

Web kasir (TanStack Start + Vite). Bukan Next.js dan bukan Prisma.

## Deploy di Vercel
1. Framework Preset: Other
2. Build Command: `npm run build`
3. Install Command: kosong (biarkan `npm install`)
4. Output Directory: kosong
5. Node.js: 22
6. Environment Variable: `DATABASE_URL` = connection string Neon
7. Redeploy

Migrasi tabel jalan otomatis saat build kalau `DATABASE_URL` terisi. Jangan pakai `prisma db push` atau `next build`.

## Login
Tidak ada akun bawaan. Buka halaman login → Daftar → isi email dan kata sandi sendiri.

## Lokal
```bash
npm install
npm run dev
```
Buka http://localhost:8080
