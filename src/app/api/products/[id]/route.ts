import { NextResponse } from "next/server";
import { getProduct, getSeller, WEAR_WITH } from "@/lib/catalog";
import { mapProduct, mapSeller } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const row = await prisma.product.findUnique({
      where: { id },
      include: { seller: true },
    });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const rules = await prisma.styleRule.findMany({
      where: { enabled: true, key: { startsWith: `wear:${id}:` } },
    });
    const wearWith = rules.map((r) => {
      const matchId = r.key.split(":")[2];
      return {
        productId: matchId,
        reasonAr: r.reasonAr,
        reasonEn: r.reasonEn,
      };
    });

    return NextResponse.json({
      source: "db",
      product: mapProduct(row),
      seller: mapSeller(row.seller),
      wearWith:
        wearWith.length > 0
          ? wearWith
          : WEAR_WITH[id] ?? [],
    });
  } catch {
    const product = getProduct(id);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      source: "fallback",
      product,
      seller: getSeller(product.sellerId),
      wearWith: WEAR_WITH[id] ?? [],
    });
  }
}
