import { NextResponse } from "next/server";
import { getCatalogModels } from "@/lib/vehicleCatalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const makeIdRaw = searchParams.get("makeId");
  const makeId = makeIdRaw ? Number(makeIdRaw) : NaN;

  if (!Number.isFinite(makeId) || makeId <= 0) {
    return NextResponse.json(
      { message: "makeId is required" },
      { status: 400 }
    );
  }

  const year = searchParams.get("year");
  const models = getCatalogModels(makeId, year);
  return NextResponse.json({ models });
}
