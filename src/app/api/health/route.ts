import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/catalog";
import { isDatabaseConfigured } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { buildPilotChecklist, getPilotConfig } from "@/lib/pilot";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  const config = await getPilotConfig();
  const checklist = await buildPilotChecklist();

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ok: true,
      status: "degraded",
      mode: "catalog",
      version: config.appVersion,
      pilotCity: config.pilotCity,
      pilotReady: checklist.ready,
      legalStatus: config.legalStatus,
      counts: { products: PRODUCTS.length, orders: 0 },
      note: "No Postgres DATABASE_URL — serving static catalog fallback (set Neon/Supabase URL on Vercel for full DB).",
      latencyMs: Date.now() - started,
      time: new Date().toISOString(),
    });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    const [productCount, orderCount] = await Promise.all([
      prisma.product.count({ where: { published: true } }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      ok: true,
      status: "healthy",
      mode: "db",
      version: config.appVersion,
      pilotCity: config.pilotCity,
      pilotReady: checklist.ready,
      legalStatus: config.legalStatus,
      counts: { products: productCount, orders: orderCount },
      latencyMs: Date.now() - started,
      time: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        status: "unhealthy",
        mode: "db",
        error: String(e),
        latencyMs: Date.now() - started,
      },
      { status: 503 },
    );
  }
}
