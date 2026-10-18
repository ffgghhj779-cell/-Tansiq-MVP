import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordParcelTiming } from "@/lib/sla";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        parcels: {
          include: {
            seller: true,
            items: { include: { product: true } },
          },
        },
        notifications: { orderBy: { createdAt: "desc" } },
        returnRequests: {
          include: { seller: true, disputes: true },
          orderBy: { createdAt: "desc" },
        },
        disputes: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ source: "db", order });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as {
      parcelId?: string;
      status?: string;
      trackingNumber?: string;
    };

    if (!body.parcelId) {
      return NextResponse.json({ error: "parcelId required" }, { status: 400 });
    }

    const existing = await prisma.parcel.findUnique({
      where: { id: body.parcelId },
    });
    if (!existing || existing.orderId !== id) {
      return NextResponse.json({ error: "Parcel not found" }, { status: 404 });
    }

    const now = new Date();
    const nextStatus = body.status ?? existing.status;
    const shippedAt =
      nextStatus === "shipped" && !existing.shippedAt
        ? now
        : existing.shippedAt;
    const deliveredAt =
      nextStatus === "delivered" && !existing.deliveredAt
        ? now
        : existing.deliveredAt;

    const parcel = await prisma.$transaction(async (tx) => {
      const updated = await tx.parcel.update({
        where: { id: body.parcelId },
        data: {
          status: nextStatus,
          ...(body.trackingNumber !== undefined
            ? { trackingNumber: body.trackingNumber }
            : {}),
          shippedAt,
          deliveredAt,
        },
        include: { seller: true },
      });

      await recordParcelTiming(tx, {
        sellerId: updated.sellerId,
        status: nextStatus,
        shippedAt: updated.shippedAt,
        deliveredAt: updated.deliveredAt,
        previousStatus: existing.status,
      });

      return updated;
    });

    return NextResponse.json({ source: "db", parcel });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
