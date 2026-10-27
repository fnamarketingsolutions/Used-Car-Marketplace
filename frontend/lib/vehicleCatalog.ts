import { getMakes, getModels, type Make } from "@meterapp/vehicle-db";

/** Passenger Car + MPV — used-car marketplace focus */
const VEHICLE_TYPE_IDS = [2, 7] as const;

export type CatalogMake = {
  makeId: number;
  makeName: string;
};

const parseYear = (year?: number | string | null): number | undefined => {
  if (year === undefined || year === null || year === "") return undefined;
  const n = typeof year === "number" ? year : Number(year);
  if (!Number.isFinite(n) || n < 1980 || n > 2100) return undefined;
  return Math.trunc(n);
};

const uniqueSortedNames = (names: string[]): string[] =>
  [...new Set(names.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

export function getCatalogMakes(year?: number | string | null): CatalogMake[] {
  const y = parseYear(year);
  const byId = new Map<number, Make>();

  for (const vehicleTypeId of VEHICLE_TYPE_IDS) {
    const makes = getMakes({
      vehicleTypeId,
      ...(y !== undefined ? { year: y } : {}),
    });
    for (const make of makes) {
      if (!byId.has(make.makeId)) {
        byId.set(make.makeId, make);
      }
    }
  }

  return [...byId.values()].sort((a, b) =>
    a.makeName.localeCompare(b.makeName, undefined, { sensitivity: "base" })
  );
}

export function getCatalogModels(
  makeId: number,
  year?: number | string | null
): string[] {
  if (!makeId) return [];

  const y = parseYear(year);
  const names: string[] = [];

  for (const vehicleTypeId of VEHICLE_TYPE_IDS) {
    const models = getModels({
      makeId,
      vehicleTypeId,
      ...(y !== undefined ? { year: y } : {}),
    });
    for (const model of models) {
      names.push(model.modelName);
    }
  }

  return uniqueSortedNames(names);
}

export function findCatalogMakeByName(
  makeName: string,
  year?: number | string | null
): CatalogMake | undefined {
  if (!makeName.trim()) return undefined;
  const needle = makeName.trim().toLowerCase();
  return getCatalogMakes(year).find(
    (make) => make.makeName.toLowerCase() === needle
  );
}
