import { NextResponse } from "next/server";
import { getCatalogMakes } from "@/lib/vehicleCatalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const makes = getCatalogMakes(year);
  return NextResponse.json({ makes });
}
  