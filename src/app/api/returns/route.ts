import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("orderId");
    const sellerId = req.nextUrl.searchParams.get("sellerId");
    const returns = await prisma.returnRequest.findMany({
      where: {
        ...(orderId ? { orderId } : {}),
        ...(sellerId ? { sellerId } : {}),
      },
      include: {
        seller: true,
        order: { select: { id: true, phone: true, total: true } },
        disputes: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ source: "db", returns });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      orderId?: string;
      sellerId?: string;
      reason?: string;
      notes?: string;
    };
    if (!body.orderId || !body.sellerId || !body.reason) {
      return NextResponse.json(
        { error: "orderId, sellerId, reason required" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
      include: { parcels: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const parcel = order.parcels.find((p) => p.sellerId === body.sellerId);
    if (!parcel) {
      return NextResponse.json(
        { error: "Seller not on this order" },
        { status: 400 },
      );
    }

    const seller = await prisma.seller.findUnique({
      where: { id: body.sellerId },
    });
    const days = seller?.returnDays ?? 7;
    const deadlineAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const ret = await prisma.returnRequest.create({
      data: {
        orderId: body.orderId,
        sellerId: body.sellerId,
        reason: body.reason,
        notes: body.notes?.trim() || "",
        status: "open",
        refundStatus: "pending",
        deadlineAt,
      },
      include: { seller: true, order: true },
    });

    return NextResponse.json({ source: "db", return: ret });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      id?: string;
      status?: string;
      refundStatus?: string;
    };
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const data: {
      status?: string;
      refundStatus?: string;
      resolvedAt?: Date;
    } = {};
    if (body.status) data.status = body.status;
    if (body.refundStatus) data.refundStatus = body.refundStatus;
    if (
      body.status === "approved" ||
      body.status === "rejected" ||
      body.refundStatus === "refunded" ||
      body.refundStatus === "denied"
    ) {
      data.resolvedAt = new Date();
    }

    const ret = await prisma.returnRequest.update({
      where: { id: body.id },
      data,
    });
    return NextResponse.json({ source: "db", return: ret });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
