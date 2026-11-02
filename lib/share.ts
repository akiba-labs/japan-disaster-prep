import { BUILDING_TYPES, TENURES, checkPrep, type BuildingType, type PrepInput, type Tenure } from "./prep";

export { PUBLIC_URL } from "./api";

type Params = URLSearchParams | Record<string, string | string[] | undefined>;
function one(p: Params, k: string): string | null {
  const v = p instanceof URLSearchParams ? p.get(k) : p[k];
  const f = Array.isArray(v) ? v[0] : v;
  return f === undefined || f === null || f === "" ? null : String(f);
}
function int(p: Params, k: string, dflt: number, max: number): number {
  const v = one(p, k);
  if (v === null || !/^\d{1,4}$/.test(v)) return dflt;
  return Math.min(Number(v), max);
}
function optNum(p: Params, k: string): number | null {
  const v = one(p, k);
  return v !== null && /^\d{1,6}(\.\d{1,2})?$/.test(v) ? Number(v) : null;
}
const ISO = /^\d{4}-\d{2}-\d{2}$/;
function flag(p: Params, k: string): boolean {
  return one(p, k) === "1";
}
function oneOf<T extends string>(p: Params, k: string, allowed: readonly T[], fallback: T): T {
  const v = one(p, k);
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

export type Shared = {
  adults: number;
  children: number;
  infants: number;
  elderly: number;
  dogs: number;
  cats: number;
  days: number;
  haveWaterLiters: number | null;
  haveMeals: number | null;
  haveToiletUses: number | null;
  builtYear: number | null;
  permitDate: string | null;
  buildingType: BuildingType;
  tenure: Tenure;
  seismicDone: boolean;
  furnitureFixed: boolean;
  hazardMapChecked: boolean;
  evacuationRouteChecked: boolean;
  goBagReady: boolean;
  drillJoined: boolean;
};

const BASE: Shared = { adults: 1, children: 0, infants: 0, elderly: 0, dogs: 0, cats: 0, days: 7, haveWaterLiters: null, haveMeals: null, haveToiletUses: null, builtYear: null, permitDate: null, buildingType: "unknown", tenure: "own", seismicDone: false, furnitureFixed: false, hazardMapChecked: false, evacuationRouteChecked: false, goBagReady: false, drillJoined: false };
export const EXAMPLE_SHARED: Shared = { ...BASE, adults: 2, children: 2, builtYear: 1979, buildingType: "wood" };
export const EXAMPLE_SOLO: Shared = { ...BASE, buildingType: "non_wood", tenure: "rent", builtYear: 2005, haveWaterLiters: 6, haveMeals: 4, furnitureFixed: true };
export const EXAMPLE_PET: Shared = { ...BASE, adults: 2, elderly: 1, cats: 1, days: 3, builtYear: 1995, buildingType: "wood", hazardMapChecked: true, evacuationRouteChecked: true, goBagReady: true, furnitureFixed: true };
export const EXAMPLES = [EXAMPLE_SHARED, EXAMPLE_SOLO, EXAMPLE_PET];

export function parseShared(p: Params): Shared | null {
  const s: Shared = {
    adults: int(p, "a", 1, 30),
    children: int(p, "c", 0, 30),
    infants: int(p, "i", 0, 30),
    elderly: int(p, "e", 0, 30),
    dogs: int(p, "d", 0, 30),
    cats: int(p, "k", 0, 30),
    days: Math.max(1, int(p, "n", 7, 30)),
    haveWaterLiters: optNum(p, "w"),
    haveMeals: optNum(p, "m"),
    haveToiletUses: optNum(p, "o"),
    builtYear: (() => {
      const y = one(p, "y");
      return y && /^\d{4}$/.test(y) && Number(y) >= 1868 && Number(y) <= 2030 ? Number(y) : null;
    })(),
    permitDate: (() => {
      const v = one(p, "p");
      return v && ISO.test(v) ? v : null;
    })(),
    buildingType: oneOf(p, "b", BUILDING_TYPES, "unknown"),
    tenure: oneOf(p, "h", TENURES, "own"),
    seismicDone: flag(p, "s"),
    furnitureFixed: flag(p, "f"),
    hazardMapChecked: flag(p, "z"),
    evacuationRouteChecked: flag(p, "r"),
    goBagReady: flag(p, "g"),
    drillJoined: flag(p, "q"),
  };
  if (s.adults + s.children + s.infants + s.elderly < 1) return null;
  return s;
}

export function sharedQuery(s: Shared): string {
  const q = new URLSearchParams();
  q.set("a", String(s.adults));
  if (s.children) q.set("c", String(s.children));
  if (s.infants) q.set("i", String(s.infants));
  if (s.elderly) q.set("e", String(s.elderly));
  if (s.dogs) q.set("d", String(s.dogs));
  if (s.cats) q.set("k", String(s.cats));
  if (s.days !== 7) q.set("n", String(s.days));
  if (s.haveWaterLiters !== null) q.set("w", String(s.haveWaterLiters));
  if (s.haveMeals !== null) q.set("m", String(s.haveMeals));
  if (s.haveToiletUses !== null) q.set("o", String(s.haveToiletUses));
  if (s.builtYear !== null) q.set("y", String(s.builtYear));
  if (s.permitDate) q.set("p", s.permitDate);
  if (s.buildingType !== "unknown") q.set("b", s.buildingType);
  if (s.tenure !== "own") q.set("h", s.tenure);
  if (s.seismicDone) q.set("s", "1");
  if (s.furnitureFixed) q.set("f", "1");
  if (s.hazardMapChecked) q.set("z", "1");
  if (s.evacuationRouteChecked) q.set("r", "1");
  if (s.goBagReady) q.set("g", "1");
  if (s.drillJoined) q.set("q", "1");
  return q.toString();
}

export function toCheckInput(s: Shared): PrepInput {
  return { ...s };
}
export function safeCheck(s: Shared) {
  try {
    return checkPrep(toCheckInput(s));
  } catch {
    return null;
  }
}
export function resultPath(s: Shared): string {
  return `/r?${sharedQuery(s)}`;
}
export function ogPath(s: Shared): string {
  return `/og?${sharedQuery(s)}`;
}
export function isIndexable(s: Shared): boolean {
  return EXAMPLES.some((e) => resultPath(e) === resultPath(s));
}
