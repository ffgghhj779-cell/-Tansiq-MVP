import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/catalog";
import { isDatabaseConfigured } from "@/lib/db";
import { mapProduct } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function applyFilters(
  items: typeof PRODUCTS,
  q: string,
  gender: string | null,
  filter: string | null,
) {
  let next = [...items];
  if (gender === "women" || gender === "men") {
    next = next.filter((p) => p.gender === gender);
  }
  if (filter === "budget") next = next.filter((p) => p.budgetFriendly);
  if (filter === "indie") next = next.filter((p) => p.independent);
  if (filter === "denim") next = next.filter((p) => p.tags.includes("denim"));
  if (filter === "shoes") next = next.filter((p) => p.tags.includes("shoes"));
  if (filter === "bags") next = next.filter((p) => p.tags.includes("bags"));
  if (filter === "street") next = next.filter((p) => p.tags.includes("street"));
  if (filter === "knit") next = next.filter((p) => p.tags.includes("knit"));
  if (filter === "layers" || filter === "outer")
    next = next.filter((p) => p.tags.includes("outer"));
  if (filter === "tops")
    next = next.filter((p) =>
      p.tags.some((t) => ["modest", "tops", "basics", "layering"].includes(t)),
    );
  if (q) {
    next = next.filter(
      (p) =>
        p.titleAr.includes(q) ||
        p.titleEn.toLowerCase().includes(q) ||
        p.fabricEn.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  return next;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const gender = searchParams.get("gender");
  const filter = searchParams.get("filter");

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      source: "catalog",
      items: applyFilters(PRODUCTS, q, gender, filter),
    });
  }

  try {
    const rows = await prisma.product.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    let items = applyFilters(rows.map(mapProduct), q, gender, filter);

    return NextResponse.json({ source: "db", items });
  } catch {
    return NextResponse.json({
      source: "catalog",
      items: applyFilters(PRODUCTS, q, gender, filter),
    });
  }
}
