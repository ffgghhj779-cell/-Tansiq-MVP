import { NextRequest, NextResponse } from "next/server";
import { buildPilotChecklist, getPilotConfig, setPilotConfig } from "@/lib/pilot";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [config, checklist] = await Promise.all([
      getPilotConfig(),
      buildPilotChecklist(),
    ]);
    return NextResponse.json({ source: "db", config, checklist });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const config = await setPilotConfig(body);
    const checklist = await buildPilotChecklist();
    return NextResponse.json({ source: "db", config, checklist });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
