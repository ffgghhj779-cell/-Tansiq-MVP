import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sellerId = req.nextUrl.searchParams.get("sellerId") || "s4";
  try {
    const parcels = await prisma.parcel.findMany({
      where: { sellerId },
      include: {
        order: true,
        items: { include: { product: true } },
      },
      orderBy: { order: { createdAt: "desc" } },
    });
    return NextResponse.json({ source: "db", sellerId, parcels });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
