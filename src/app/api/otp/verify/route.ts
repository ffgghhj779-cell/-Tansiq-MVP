import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      challengeId?: string;
      phone?: string;
      code?: string;
    };
    if (!body.challengeId || !body.phone || !body.code) {
      return NextResponse.json(
        { error: "challengeId, phone, and code required" },
        { status: 400 },
      );
    }
    const result = await verifyOtp({
      challengeId: body.challengeId,
      phone: body.phone,
      code: body.code,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
