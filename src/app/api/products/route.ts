import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/catalog";
import { mapProduct } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const gender = searchParams.get("gender");
  const filter = searchParams.get("filter");

  try {
    const rows = await prisma.product.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    let items = rows.map(mapProduct);

    if (gender === "women" || gender === "men") {
      items = items.filter((p) => p.gender === gender);
    }
    if (filter === "budget") items = items.filter((p) => p.budgetFriendly);
    if (filter === "indie") items = items.filter((p) => p.independent);
    if (filter === "denim") items = items.filter((p) => p.tags.includes("denim"));
    if (filter === "shoes") items = items.filter((p) => p.tags.includes("shoes"));
    if (filter === "bags") items = items.filter((p) => p.tags.includes("bags"));
    if (filter === "street") items = items.filter((p) => p.tags.includes("street"));
    if (filter === "knit") items = items.filter((p) => p.tags.includes("knit"));
    if (filter === "layers" || filter === "outer")
      items = items.filter((p) => p.tags.includes("outer"));
    if (filter === "tops")
      items = items.filter((p) =>
        p.tags.some((t) => ["modest", "tops", "basics", "layering"].includes(t)),
      );
    if (q) {
      items = items.filter(
        (p) =>
          p.titleAr.includes(q) ||
          p.titleEn.toLowerCase().includes(q) ||
          p.fabricEn.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return NextResponse.json({ source: "db", items });
  } catch {
    let items = [...PRODUCTS];
    if (gender === "women" || gender === "men") {
      items = items.filter((p) => p.gender === gender);
    }
    if (q) {
      items = items.filter(
        (p) =>
          p.titleEn.toLowerCase().includes(q) || p.titleAr.includes(q),
      );
    }
    return NextResponse.json({ source: "fallback", items });
  }
}
