import { NextRequest, NextResponse } from "next/server";
import {
  isStyleEngineEnabled,
  setStyleEngineEnabled,
} from "@/lib/style-engine";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const enabled = await isStyleEngineEnabled();
    const ruleCounts = await prisma.styleRule.groupBy({
      by: ["kind"],
      _count: true,
      where: { enabled: true },
    });
    const feedback = await prisma.styleFeedback.groupBy({
      by: ["vote"],
      _count: true,
    });
    return NextResponse.json({
      source: "db",
      enabled,
      ruleCounts,
      feedback,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { enabled?: boolean };
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json({ error: "enabled boolean required" }, { status: 400 });
    }
    await setStyleEngineEnabled(body.enabled);
    return NextResponse.json({ source: "db", enabled: body.enabled });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
