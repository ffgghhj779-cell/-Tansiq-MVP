import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [reports, pendingSellers] = await Promise.all([
      prisma.report.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.seller.findMany({ where: { status: "pending" } }),
    ]);
    return NextResponse.json({ source: "db", reports, pendingSellers });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      reportId?: string;
      sellerId?: string;
      status?: string;
    };
    if (body.reportId && body.status) {
      const report = await prisma.report.update({
        where: { id: body.reportId },
        data: { status: body.status },
      });
      return NextResponse.json({ report });
    }
    if (body.sellerId && body.status) {
      const seller = await prisma.seller.update({
        where: { id: body.sellerId },
        data: {
          status: body.status,
          verified: body.status === "approved",
        },
      });
      return NextResponse.json({ seller });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
