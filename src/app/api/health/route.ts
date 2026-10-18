import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildPilotChecklist, getPilotConfig } from "@/lib/pilot";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const [config, checklist, productCount, orderCount] = await Promise.all([
      getPilotConfig(),
      buildPilotChecklist(),
      prisma.product.count({ where: { published: true } }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      ok: true,
      status: "healthy",
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
        error: String(e),
        latencyMs: Date.now() - started,
      },
      { status: 503 },
    );
  }
}
