import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(
      Number(req.nextUrl.searchParams.get("limit") || "50"),
      200,
    );
    const errors = await prisma.clientError.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    const last24h = await prisma.clientError.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    return NextResponse.json({ source: "db", last24h, errors });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      message?: string;
      stack?: string;
      path?: string;
      userAgent?: string;
      source?: string;
    };
    if (!body.message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }
    const row = await prisma.clientError.create({
      data: {
        message: String(body.message).slice(0, 2000),
        stack: String(body.stack || "").slice(0, 8000),
        path: String(body.path || "").slice(0, 500),
        userAgent: String(body.userAgent || "").slice(0, 500),
        source: body.source || "client",
      },
    });
    return NextResponse.json({ source: "db", id: row.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
