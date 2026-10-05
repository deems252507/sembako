# Warung Sembako POS

## Database Neon (wajib agar data sama di semua HP/PC)

1. Buka https://console.neon.tech → buat project
2. Copy **Connection string** (PostgreSQL)
3. Di **Vercel** → Project → Settings → Environment Variables:
   - Name: `DATABASE_URL`
   - Value: `postgresql://...@...neon.tech/neondb?sslmode=require`
4. Redeploy project
5. Jalankan migrasi tabel (satu kali), dari laptop:

```bash
# Set DATABASE_URL dulu
export DATABASE_URL="postgresql://..."
npx prisma db push
```

Atau di Vercel, tambah build command:
`prisma generate && prisma db push && next build`

Setelah itu, buka **Pengaturan** → Simpan → nama toko tersimpan di database dan sama di semua perangkat.

## Login
Username & password bebas (demo), contoh: admin / admin
