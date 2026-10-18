import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get("phone");
    const tickets = await prisma.supportTicket.findMany({
      where: phone ? { phone } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ source: "db", tickets });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      phone?: string;
      subject?: string;
      body?: string;
      channel?: string;
    };
    if (!body.phone || !body.subject || !body.body) {
      return NextResponse.json(
        { error: "phone, subject, body required" },
        { status: 400 },
      );
    }
    const ticket = await prisma.supportTicket.create({
      data: {
        phone: body.phone.replace(/\s+/g, "").trim(),
        subject: body.subject.trim(),
        body: body.body.trim(),
        channel: body.channel || "in_app",
        status: "open",
      },
    });
    return NextResponse.json({ source: "db", ticket });
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
    const ticket = await prisma.supportTicket.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json({ source: "db", ticket });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
