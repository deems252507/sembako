import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "no_db", message: "DATABASE_URL belum diset" }, { status: 503 });
    }
    let settings = await prisma.storeSettings.findFirst({ orderBy: { updated_at: "desc" } });
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          store_name: "Warung Sembako",
          address: "",
          phone: "",
          whatsapp: "",
          email: "",
          slogan: "Kelola Warung, Lebih Mudah",
          footer_receipt: "Terima kasih telah berbelanja!",
        },
      });
    }
    return NextResponse.json(settings);
  } catch (e: any) {
    console.error("GET settings", e);
    return NextResponse.json({ error: "db_error", message: e?.message || "DB error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "no_db" }, { status: 503 });
    }
    const body = await req.json();
    const existing = await prisma.storeSettings.findFirst({ orderBy: { updated_at: "desc" } });
    const data = {
      store_name: body.store_name ?? "Warung Sembako",
      address: body.address ?? "",
      phone: body.phone ?? "",
      whatsapp: body.whatsapp ?? "",
      email: body.email ?? null,
      slogan: body.slogan ?? null,
      footer_receipt: body.footer_receipt ?? null,
      logo: body.logo ?? null,
    };
    let settings;
    if (existing) {
      settings = await prisma.storeSettings.update({ where: { id: existing.id }, data });
    } else {
      settings = await prisma.storeSettings.create({ data });
    }
    return NextResponse.json(settings);
  } catch (e: any) {
    console.error("PUT settings", e);
    return NextResponse.json({ error: "db_error", message: e?.message || "DB error" }, { status: 500 });
  }
}
