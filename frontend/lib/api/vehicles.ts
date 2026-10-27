import type { CatalogMake } from "@/lib/vehicleCatalog";

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body === "object" &&
      body &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function fetchVehicleMakes(year?: string): Promise<CatalogMake[]> {
  const params = new URLSearchParams();
  if (year?.trim()) params.set("year", year.trim());
  const qs = params.toString();
  const res = await fetch(`/api/vehicles/makes${qs ? `?${qs}` : ""}`);
  const data = await readJson<{ makes: CatalogMake[] }>(res);
  return data.makes;
}

export async function fetchVehicleModels(
  makeId: number,
  year?: string
): Promise<string[]> {
  const params = new URLSearchParams({ makeId: String(makeId) });
  if (year?.trim()) params.set("year", year.trim());
  const res = await fetch(`/api/vehicles/models?${params.toString()}`);
  const data = await readJson<{ models: string[] }>(res);
  return data.models;
}
