import { NextResponse } from "next/server";
import { csvUrl, parseCSV } from "@/lib/sheets";

export const runtime = "edge";
export const revalidate = 30; // cache 30 s

export async function GET() {
  try {
    const url = csvUrl();
    const res = await fetch(url, {
      redirect: "follow",
      headers: { Accept: "text/csv" },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Sheet fetch failed: ${res.status}` },
        { status: 502 }
      );
    }

    const raw = await res.text();
    const rows = parseCSV(raw);

    return NextResponse.json(
      { rows, updatedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[sheets/route]", err);
    return NextResponse.json(
      { error: "Failed to fetch sheet data" },
      { status: 500 }
    );
  }
}
