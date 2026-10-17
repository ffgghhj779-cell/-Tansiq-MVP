import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        parcels: {
          include: {
            seller: true,
            items: { include: { product: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ source: "db", orders });
  } catch (e) {
    return NextResponse.json(
      { source: "error", orders: [], message: String(e) },
      { status: 500 },
    );
  }
}

type IncomingLine = {
  productId: string;
  size: string;
  colorId: string;
  qty: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      phone: string;
      address: string;
      lines: IncomingLine[];
    };

    if (!body.phone || !body.lines?.length) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const productIds = [...new Set(body.lines.map((l) => l.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const byId = Object.fromEntries(products.map((p) => [p.id, p]));

    const bySeller = new Map<string, IncomingLine[]>();
    for (const line of body.lines) {
      const p = byId[line.productId];
      if (!p) continue;
      const list = bySeller.get(p.sellerId) ?? [];
      list.push(line);
      bySeller.set(p.sellerId, list);
    }

    let total = 0;
    const parcelCreates = [...bySeller.entries()].map(([sellerId, lines]) => {
      const subtotal = lines.reduce(
        (s, l) => s + byId[l.productId].price * l.qty,
        0,
      );
      const deliveryFee = 20 + Math.round(subtotal / 200) * 5;
      total += subtotal + deliveryFee;
      return {
        sellerId,
        status: "confirmed",
        trackingNumber: "",
        deliveryFee,
        etaAr: "٢–٤ أيام",
        etaEn: "2–4 days",
        items: {
          create: lines.map((l) => ({
            productId: l.productId,
            size: l.size,
            colorId: l.colorId,
            qty: l.qty,
            unitPrice: byId[l.productId].price,
          })),
        },
      };
    });

    const orderId = `TQ-${Math.floor(10000 + Math.random() * 89999)}`;
    const order = await prisma.order.create({
      data: {
        id: orderId,
        phone: body.phone,
        address: body.address || "Address pending",
        payment: "cod",
        status: "placed",
        total,
        parcels: { create: parcelCreates },
      },
      include: { parcels: { include: { items: true, seller: true } } },
    });

    return NextResponse.json({ source: "db", order });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
