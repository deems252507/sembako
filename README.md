# Aplikasi Kasir / POS

Sumber kode web app kasir (dashboard, produk, stok, hutang, keuangan, shift).

## Yang di-upload ke GitHub
Folder ini sudah dibersihkan. Jangan upload:
- `node_modules/`
- `.vercel/` (hasil build)
- `.grok/` (file internal workspace)

## Cara jalan lokal
```bash
npm install
npm run dev
```
Buka http://localhost:8080

Database lokal memakai PGlite. Untuk production (Vercel/Neon), set `DATABASE_URL` di environment, jangan taruh di kode.
