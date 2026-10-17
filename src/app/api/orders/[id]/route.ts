import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    if (body.parcelId) {
      const parcel = await prisma.parcel.update({
        where: { id: body.parcelId },
        data: {
          ...(body.status ? { status: body.status } : {}),
          ...(body.trackingNumber !== undefined
            ? { trackingNumber: body.trackingNumber }
            : {}),
        },
      });
      return NextResponse.json({ source: "db", parcel });
    }

    return NextResponse.json({ error: "parcelId required" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
