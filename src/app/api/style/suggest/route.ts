import { NextRequest, NextResponse } from "next/server";
import {
  suggestBudget,
  suggestColor,
  suggestComplete,
  suggestMatch,
} from "@/lib/style-engine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const tool = req.nextUrl.searchParams.get("tool") || "match";
    const seed = req.nextUrl.searchParams.get("seed") || "p1";
    const budget = Number(req.nextUrl.searchParams.get("budget") || "500");
    const occasion = (req.nextUrl.searchParams.get("occasion") ||
      "cafe") as "cafe" | "campus" | "street";
    const color = req.nextUrl.searchParams.get("color") || "olive";

    let result;
    switch (tool) {
      case "complete":
        result = await suggestComplete(seed);
        break;
      case "budget":
        result = await suggestBudget({ budget, occasion });
        break;
      case "color":
        result = await suggestColor(color);
        break;
      case "match":
      default:
        result = await suggestMatch(seed);
        break;
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
