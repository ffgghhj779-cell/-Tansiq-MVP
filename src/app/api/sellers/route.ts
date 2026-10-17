import { NextResponse } from "next/server";
import { SELLERS } from "@/lib/catalog";
import { mapSeller } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.seller.findMany({ orderBy: { nameEn: "asc" } });
    return NextResponse.json({ source: "db", sellers: rows.map(mapSeller), raw: rows });
  } catch {
    return NextResponse.json({ source: "fallback", sellers: SELLERS, raw: [] });
  }
}
