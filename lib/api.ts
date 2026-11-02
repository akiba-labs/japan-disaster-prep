import { InputError, type Endpoint, type Input } from "./agent-api";
import { BUILDING_TYPES, DISCLAIMER, RULES_AS_OF, RuleInputError, TENURES, checkPrep, type BuildingType, type Tenure } from "./prep";
import { SITE_NAME, SITE_TAGLINE } from "./site";

export const PUBLIC_URL = "https://japan-disaster-prep.vercel.app";
export const API_DISCLAIMER = DISCLAIMER;
export const API_INFO = { title: `${SITE_NAME} API`, description: SITE_TAGLINE, version: "1.0.0" };

export const EXAMPLE_GET = "/api/check?adults=2&children=2&days=7&builtYear=1979&buildingType=wood";

function first(v: unknown): unknown {
  return Array.isArray(v) ? v[0] : v;
}
function s(v: unknown): string | null {
  const f = first(v);
  return f === undefined || f === null || String(f).trim() === "" ? null : String(f).trim();
}
function tb(v: unknown, name: string): boolean | undefined {
  const f = first(v);
  if (typeof f === "boolean") return f;
  if (f === undefined || f === null || String(f).trim() === "") return undefined;
  const t = String(f).trim();
  if (/^(1|true|yes|y|on|done|はい|済|済み)$/i.test(t)) return true;
  if (/^(0|false|no|n|off|いいえ|未)$/i.test(t)) return false;
  throw new InputError(`${name} must be true or false`);
}
function n(v: unknown, name: string): number | undefined {
  const f = s(v);
  if (f === null) return undefined;
  const x = Number(f.normalize("NFKC"));
  if (!Number.isFinite(x)) throw new InputError(`${name} must be a number`);
  return x;
}

const TYPE_ALIASES: Record<string, BuildingType> = {
  wooden: "wood", timber: "wood", house: "wood", detached: "wood", 木造: "wood", 戸建て: "wood", 一戸建て: "wood",
  concrete: "non_wood", rc: "non_wood", src: "non_wood", steel: "non_wood", apartment: "non_wood", mansion: "non_wood", condo: "non_wood", 鉄筋: "non_wood", 鉄骨: "non_wood", マンション: "non_wood", 非木造: "non_wood",
  "?": "unknown", dont_know: "unknown", 不明: "unknown",
};
const TENURE_ALIASES: Record<string, Tenure> = { owner: "own", owned: "own", 持ち家: "own", 持家: "own", renter: "rent", rental: "rent", renting: "rent", tenant: "rent", 賃貸: "rent" };

function pick<T extends string>(raw: string | null, allowed: readonly T[], aliases: Record<string, T>, name: string): T | undefined {
  if (!raw) return undefined;
  const k = raw.toLowerCase().replace(/[\s-]+/g, "_");
  const v = (aliases[k] ?? aliases[raw] ?? k) as T;
  if (!(allowed as readonly string[]).includes(v)) throw new InputError(`Invalid ${name} "${raw}". Allowed: ${allowed.join(", ")}`);
  return v;
}

export function computeCheck(input: Input) {
  try {
    return checkPrep({
      adults: n(input.adults ?? input.people ?? input.persons ?? input.大人, "adults"),
      children: n(input.children ?? input.kids ?? input.子ども, "children"),
      infants: n(input.infants ?? input.babies ?? input.baby ?? input.乳幼児, "infants"),
      elderly: n(input.elderly ?? input.seniors ?? input.高齢者, "elderly"),
      dogs: n(input.dogs ?? input.dog, "dogs"),
      cats: n(input.cats ?? input.cat, "cats"),
      days: n(input.days ?? input.日数, "days"),
      haveWaterLiters: n(input.haveWaterLiters ?? input.haveWater ?? input.water, "haveWaterLiters") ?? null,
      haveMeals: n(input.haveMeals ?? input.meals ?? input.food, "haveMeals") ?? null,
      haveToiletUses: n(input.haveToiletUses ?? input.toilets ?? input.haveToilets, "haveToiletUses") ?? null,
      builtYear: s(input.builtYear ?? input.year ?? input.built ?? input.築年),
      permitDate: s(input.permitDate ?? input.buildingPermitDate ?? input.建築確認日),
      buildingType: pick(s(input.buildingType ?? input.structure ?? input.構造), BUILDING_TYPES, TYPE_ALIASES, "buildingType"),
      tenure: pick(s(input.tenure ?? input.home), TENURES, TENURE_ALIASES, "tenure"),
      seismicDone: tb(input.seismicDone ?? input.diagnosisDone ?? input.retrofitted, "seismicDone"),
      furnitureFixed: tb(input.furnitureFixed ?? input.furniture, "furnitureFixed"),
      hazardMapChecked: tb(input.hazardMapChecked ?? input.hazardMap, "hazardMapChecked"),
      evacuationRouteChecked: tb(input.evacuationRouteChecked ?? input.evacuationRoute ?? input.route, "evacuationRouteChecked"),
      goBagReady: tb(input.goBagReady ?? input.goBag ?? input.grabBag, "goBagReady"),
      drillJoined: tb(input.drillJoined ?? input.drill, "drillJoined"),
    });
  } catch (e) {
    if (e instanceof RuleInputError) throw new InputError(e.message);
    throw e;
  }
}

export const ENDPOINTS: Record<"check", Endpoint> = {
  check: {
    path: "/api/check",
    operationId: "japanDisasterPrepCheck",
    summary: "Japan's 2026-11-02 防災庁 emergency request (事前防災徹底のための緊急要請) as a household checklist: how much water, food and portable-toilet stock, is the house old-quake-standard, and what's left to do.",
    description: `Applies the five-point request issued by Japan's new Disaster Management Agency (防災庁) on 2026-11-02 (rules as of ${RULES_AS_OF}): 1 耐震診断 for homes built 昭和56年 (1981) or earlier + furniture fixing; 2 stockpile at least 3 days, ideally 1 week: drinking water 3 L per person per day (incl. cooking), food, portable toilets (5 uses per person per day, METI / 防災庁) plus tissues and toilet paper; 3 hazard map, evacuation site and route; 4 grab bag; 5 disaster drill. Building era from the 建築確認 date (before 1981-06-01 = 旧耐震; wooden houses 1981-06-01 – 2000-05-31 → MLIT 新耐震木造住宅検証法 self-check) or the build year (accepts 昭和/平成/令和 and S/H/R). Pets: food and water 5+ days, ideally 7+ (MoE). Returns verdict (well_prepared | partly_prepared | not_prepared), summary, doneCount, household, days, stockpile {water {target, minimum3Days, have, gap, bottles2L}, meals, toiletUses, pets, alsoStock[], rollingStock}, building {era (old_standard | likely_old | new_pre2000_wood | new_standard | unknown), label, action}, request[{n, title, ja, status (done | partial | todo), todo[]}], links, note, sources, disclaimer. Does not inspect buildings or predict disasters.`,
    params: [
      { name: "adults", type: "number", default: 1, description: "Adults in the household (aliases: people, persons, 大人)." },
      { name: "children", type: "number", default: 0, description: "Children (count like adults for water, food and toilets)." },
      { name: "infants", type: "number", default: 0, description: "Babies on milk / in diapers: counted for water, listed for milk and diapers, not for meals or toilet uses." },
      { name: "elderly", type: "number", default: 0, description: "Older family members (adds medicine / care items)." },
      { name: "dogs", type: "number", default: 0, description: "Dogs (pet food and water 5+ days, ideally 7+)." },
      { name: "cats", type: "number", default: 0, description: "Cats." },
      { name: "days", type: "number", default: 7, description: "Days to stock for, 1–30. The request: at least 3, ideally 7 (1 week)." },
      { name: "haveWaterLiters", type: "number", description: "Optional drinking water you already have, in litres → gap." },
      { name: "haveMeals", type: "number", description: "Optional meals of stored food you already have → gap." },
      { name: "haveToiletUses", type: "number", description: "Optional portable / emergency toilet uses (bags) you already have → gap." },
      { name: "builtYear", type: "string", description: "Year the home was built: 1979, 昭和54, S54, 平成12, H12… (aliases: year, 築年)." },
      { name: "permitDate", type: "string", description: "Optional YYYY-MM-DD 建築確認 date on the 確認済証 (exact old/new standard line 1981-06-01)." },
      { name: "buildingType", type: "string", enum: BUILDING_TYPES, default: "unknown", description: "wood (木造 house) | non_wood (RC / steel, most マンション) | unknown." },
      { name: "tenure", type: "string", enum: TENURES, default: "own", description: "own | rent (賃貸: ask the landlord about 耐震)." },
      { name: "seismicDone", type: "boolean", default: false, description: "Already had a 耐震診断 that passed, or a retrofit." },
      { name: "furnitureFixed", type: "boolean", default: false, description: "Tall furniture and appliances are fixed." },
      { name: "hazardMapChecked", type: "boolean", default: false, description: "Checked the hazard maps for home and work." },
      { name: "evacuationRouteChecked", type: "boolean", default: false, description: "Know the evacuation site and route." },
      { name: "goBagReady", type: "boolean", default: false, description: "Grab bag (非常持ち出し品) packed." },
      { name: "drillJoined", type: "boolean", default: false, description: "Joined a local disaster drill." },
    ],
    example: EXAMPLE_GET,
    compute: computeCheck,
  },
};

export const PLUGIN = {
  name: "Japan Disaster Prep Check",
  nameForModel: "japan_disaster_prep",
  descriptionForHuman: "Japan's 防災庁 emergency request as a checklist: water, food, portable toilets, 耐震 and what's left.",
  descriptionForModel:
    "Use when someone in Japan asks how to follow the Disaster Management Agency's (防災庁) 2026-11-02 emergency request (事前防災徹底のための緊急要請), how much water / food / portable toilets (携帯トイレ) to stockpile for their household for 3 days or a week (備蓄), whether their house is old quake standard (旧耐震, built before June 1981) and needs a 耐震診断, or what to put in a grab bag. Computes amounts from the official per-person figures instead of guessing; relay the disclaimer (educational, no building inspection, no disaster prediction).",
  logo: "/icon.svg",
};
