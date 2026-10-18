import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      source: "catalog",
      summary: { good: 0, not_for_me: 0, total: 0 },
      feedback: [],
    });
  }
  try {
    const tool = req.nextUrl.searchParams.get("tool");
    const rows = await prisma.styleFeedback.findMany({
      where: tool ? { tool } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    const summary = {
      good: rows.filter((r) => r.vote === "good").length,
      not_for_me: rows.filter((r) => r.vote === "not_for_me").length,
      total: rows.length,
    };
    return NextResponse.json({ source: "db", summary, feedback: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      tool?: string;
      seedProductId?: string;
      suggestedProductId?: string;
      vote?: string;
      note?: string;
    };
    if (!body.tool || !body.suggestedProductId || !body.vote) {
      return NextResponse.json(
        { error: "tool, suggestedProductId, vote required" },
        { status: 400 },
      );
    }
    if (body.vote !== "good" && body.vote !== "not_for_me") {
      return NextResponse.json(
        { error: "vote must be good or not_for_me" },
        { status: 400 },
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        source: "catalog",
        feedback: {
          id: `local-${Date.now()}`,
          tool: body.tool,
          seedProductId: body.seedProductId || "",
          suggestedProductId: body.suggestedProductId,
          vote: body.vote,
          note: body.note?.trim() || "",
        },
      });
    }

    const row = await prisma.styleFeedback.create({
      data: {
        tool: body.tool,
        seedProductId: body.seedProductId || "",
        suggestedProductId: body.suggestedProductId,
        vote: body.vote,
        note: body.note?.trim() || "",
      },
    });
    return NextResponse.json({ source: "db", feedback: row });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
