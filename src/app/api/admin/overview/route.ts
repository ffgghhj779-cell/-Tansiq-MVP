import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      reports,
      pendingSellers,
      sellers,
      disputes,
      returns,
      tickets,
      openReports,
      openDisputes,
      openReturns,
      openTickets,
    ] = await Promise.all([
      prisma.report.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.seller.findMany({ where: { status: "pending" } }),
      prisma.seller.findMany({
        orderBy: { deliveryScore: "asc" },
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          status: true,
          verified: true,
          deliveryScore: true,
          slaHours: true,
          onTimeCount: true,
          lateCount: true,
          returnDays: true,
        },
      }),
      prisma.dispute.findMany({
        include: {
          order: { select: { id: true, phone: true } },
          returnReq: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.returnRequest.findMany({
        include: {
          seller: true,
          order: { select: { id: true, phone: true, total: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.supportTicket.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.report.count({ where: { status: "open" } }),
      prisma.dispute.count({ where: { status: "open" } }),
      prisma.returnRequest.count({ where: { status: "open" } }),
      prisma.supportTicket.count({ where: { status: "open" } }),
    ]);

    return NextResponse.json({
      source: "db",
      counts: {
        openReports,
        openDisputes,
        openReturns,
        openTickets,
        pendingSellers: pendingSellers.length,
      },
      reports,
      pendingSellers,
      sellers,
      disputes,
      returns,
      tickets,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
