import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const disputes = await prisma.dispute.findMany({
      include: {
        order: { select: { id: true, phone: true, total: true } },
        returnReq: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ source: "db", disputes });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      orderId?: string;
      returnId?: string;
      type?: string;
      reason?: string;
    };
    if (!body.reason || !body.type) {
      return NextResponse.json(
        { error: "type and reason required" },
        { status: 400 },
      );
    }
    const dispute = await prisma.dispute.create({
      data: {
        orderId: body.orderId || null,
        returnId: body.returnId || null,
        type: body.type,
        reason: body.reason,
        status: "open",
      },
    });
    return NextResponse.json({ source: "db", dispute });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: string; status?: string };
    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: "id and status required" },
        { status: 400 },
      );
    }
    const dispute = await prisma.dispute.update({
      where: { id: body.id },
      data: {
        status: body.status,
        ...(body.status === "resolved" || body.status === "closed"
          ? { resolvedAt: new Date() }
          : {}),
      },
    });
    return NextResponse.json({ source: "db", dispute });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
