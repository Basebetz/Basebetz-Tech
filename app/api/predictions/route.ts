import { NextResponse } from "next/server";
import { getAllPredictions } from "@/lib/predictions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const predictions = await getAllPredictions();
    return NextResponse.json(predictions, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
