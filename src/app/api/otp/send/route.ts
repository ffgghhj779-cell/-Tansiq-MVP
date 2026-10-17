import { NextRequest, NextResponse } from "next/server";
import { sendOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { phone?: string; purpose?: string };
    if (!body.phone) {
      return NextResponse.json({ error: "phone required" }, { status: 400 });
    }
    const result = await sendOtp(body.phone, body.purpose ?? "order");
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
