import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { appName, sendEmail, welcomeEmailHtml } from "./send";

/** Dipanggil setelah daftar sukses — kirim email selamat datang. */
export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      name: z.string().optional().default(""),
    }),
  )
  .handler(async ({ data }) => {
    const result = await sendEmail({
      to: data.email,
      subject: `Selamat bergabung di ${appName()}!`,
      html: welcomeEmailHtml({
        name: data.name || data.email.split("@")[0] || "Pengguna",
        email: data.email,
      }),
      text: `Selamat bergabung! Akun ${data.email} sudah siap digunakan di ${appName()}.`,
    });
    return result;
  });
