import { NextRequest, NextResponse } from "next/server";
import { queueOrderConfirmation } from "@/lib/notify";
import { assertOtpToken } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { decrementStock } from "@/lib/stock";

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
        notifications: true,
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
      address?: string;
      city?: string;
      district?: string;
      shortAddress?: string;
      nationalAddress?: string;
      lines: IncomingLine[];
      otpChallengeId?: string;
      otpToken?: string;
    };

    if (!body.phone || !body.lines?.length) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!body.otpChallengeId || !body.otpToken) {
      return NextResponse.json(
        { error: "OTP verification required" },
        { status: 401 },
      );
    }

    if (!assertOtpToken(body.otpChallengeId, body.phone, body.otpToken)) {
      return NextResponse.json(
        { error: "Invalid or expired OTP token" },
        { status: 401 },
      );
    }

    const city = (body.city || "").trim();
    const district = (body.district || "").trim();
    const shortAddress = (body.shortAddress || "").trim();
    const nationalAddress = (body.nationalAddress || "").trim();
    const address =
      (body.address || "").trim() ||
      [city, district, shortAddress || nationalAddress]
        .filter(Boolean)
        .join(" — ");

    if (!city || !district) {
      return NextResponse.json(
        { error: "city and district required" },
        { status: 400 },
      );
    }

    const productIds = [...new Set(body.lines.map((l) => l.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const byId = Object.fromEntries(products.map((p) => [p.id, p]));

    for (const line of body.lines) {
      if (!byId[line.productId]) {
        return NextResponse.json(
          { error: `Unknown product: ${line.productId}` },
          { status: 400 },
        );
      }
      if (!line.size || !line.qty || line.qty < 1) {
        return NextResponse.json({ error: "Invalid line" }, { status: 400 });
      }
    }

    const bySeller = new Map<string, IncomingLine[]>();
    for (const line of body.lines) {
      const p = byId[line.productId];
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

    const order = await prisma.$transaction(async (tx) => {
      await decrementStock(
        tx,
        body.lines.map((l) => ({
          productId: l.productId,
          size: l.size,
          qty: l.qty,
        })),
      );

      return tx.order.create({
        data: {
          id: orderId,
          phone: body.phone.replace(/\s+/g, "").trim(),
          address: address || "Address pending",
          city,
          district,
          shortAddress,
          nationalAddress,
          payment: "cod",
          status: "confirmed",
          total,
          otpVerified: true,
          confirmedAt: new Date(),
          parcels: { create: parcelCreates },
        },
        include: {
          parcels: { include: { items: true, seller: true } },
        },
      });
    });

    await queueOrderConfirmation({
      orderId: order.id,
      phone: order.phone,
      total: order.total,
      parcelCount: order.parcels.length,
    });

    const withNotifications = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        parcels: { include: { items: true, seller: true } },
        notifications: true,
      },
    });

    return NextResponse.json({ source: "db", order: withNotifications ?? order });
  } catch (e) {
    const message = String(e);
    const status = message.includes("Insufficient stock") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
