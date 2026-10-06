/**
 * Pengirim email sederhana.
 * - Jika RESEND_API_KEY ada → kirim lewat Resend API
 * - Jika tidak → log ke console (dev/preview tetap jalan)
 *
 * ENV opsional:
 *   RESEND_API_KEY
 *   EMAIL_FROM          (default: "Sembako <onboarding@resend.dev>")
 *   APP_NAME            (default: "Sistem Manajemen Toko")
 */

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function fromAddress(): string {
  return (
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM ||
    "Sembako <onboarding@resend.dev>"
  );
}

export function appName(): string {
  return process.env.APP_NAME || "Sistem Manajemen Toko";
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.info("[email] RESEND_API_KEY belum di-set — email tidak dikirim (dev mode)");
    console.info("[email]", { to: input.to, subject: input.subject, text: input.text || input.html.slice(0, 200) });
    return { ok: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend error", res.status, body);
      return { ok: false, error: `Gagal kirim email (${res.status}): ${body.slice(0, 300)}` };
    }
    console.info("[email] Resend accepted", { to: input.to, subject: input.subject });
    return { ok: true };
  } catch (err) {
    console.error("[email] send failed", err);
    return { ok: false, error: err instanceof Error ? err.message : "Gagal kirim email" };
  }
}

export function resetPasswordEmailHtml(opts: {
  name: string;
  url: string;
  storeLabel?: string;
}): string {
  const brand = opts.storeLabel || appName();
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f5f7f6;font-family:Segoe UI,Arial,sans-serif;color:#1a1f1c">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:14px;border:1px solid #e5ebe7;overflow:hidden">
        <tr><td style="background:#0f3d2a;padding:20px 24px">
          <p style="margin:0;color:#f0fdf6;font-size:16px;font-weight:700">${brand}</p>
        </td></tr>
        <tr><td style="padding:28px 24px">
          <h1 style="margin:0 0 12px;font-size:20px">Reset kata sandi</h1>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4b5563">
            Halo${opts.name ? ` ${opts.name}` : ""}, kami menerima permintaan untuk mengatur ulang kata sandi akun Anda.
          </p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#4b5563">
            Klik tombol di bawah. Link berlaku terbatas — jika Anda tidak meminta ini, abaikan saja email ini.
          </p>
          <a href="${opts.url}" style="display:inline-block;background:#1b7a4e;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:10px">
            Atur ulang kata sandi
          </a>
          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;word-break:break-all">
            Atau salin tautan ini:<br/>${opts.url}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function welcomeEmailHtml(opts: {
  name: string;
  email: string;
  storeLabel?: string;
}): string {
  const brand = opts.storeLabel || appName();
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f5f7f6;font-family:Segoe UI,Arial,sans-serif;color:#1a1f1c">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:14px;border:1px solid #e5ebe7;overflow:hidden">
        <tr><td style="background:#0f3d2a;padding:20px 24px">
          <p style="margin:0;color:#f0fdf6;font-size:16px;font-weight:700">${brand}</p>
        </td></tr>
        <tr><td style="padding:28px 24px">
          <h1 style="margin:0 0 12px;font-size:20px">Selamat bergabung!</h1>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4b5563">
            Halo <strong>${opts.name || "Pengguna"}</strong>, terima kasih telah mendaftar.
            Akun Anda dengan email <strong>${opts.email}</strong> sudah siap digunakan.
          </p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#4b5563">
            Anda bisa mulai dari:
          </p>
          <ul style="margin:0 0 20px;padding-left:18px;font-size:14px;line-height:1.7;color:#4b5563">
            <li>Mengisi data toko di Pengaturan</li>
            <li>Menambah produk &amp; stok</li>
            <li>Melayani penjualan di Kasir</li>
          </ul>
          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5">
            Jika Anda lupa kata sandi nanti, gunakan menu <em>Lupa kata sandi</em> di halaman login — tidak perlu menghubungi admin.
          </p>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #e5ebe7;font-size:12px;color:#9ca3af">
          Email otomatis dari ${brand}. Mohon jangan membalas email ini.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
