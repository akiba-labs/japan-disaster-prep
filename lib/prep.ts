// Japan Disaster Prep Check: the 防災庁 「事前防災徹底のための緊急要請」 (2026-11-02) as a household checklist.
// Educational reading of the request text (防災大臣 細野豪志), the Prime Minister's Office 災害への備え page,
// the 防災庁 / METI portable-toilet guidance (5 uses per person per day), MLIT seismic pages (旧耐震 = before 1981-06-01,
// 新耐震木造住宅検証法 for wooden houses 1981-06-01 – 2000-05-31) and the MoE pet disaster pamphlet (5+ days, ideally 7+).

export const RULES_AS_OF = "2026-11-02";

export const SOURCES = [
  "https://www.sankei.com/article/20261102-5DZVTGGLPVEU7EJWILSJU4TAWM/",
  "https://www.fnn.jp/articles/-/1144215",
  "https://www.kantei.go.jp/jp/headline/bousai/sonae.html",
  "https://www.bousai.go.jp/kohou/kouhoubousai/r06/111/news_08.html",
  "https://www.mlit.go.jp/jutakukentiku/house/jutakukentiku_house_fr_000043.html",
  "https://www.mlit.go.jp/report/press/house05_hh_000662.html",
  "https://www.env.go.jp/nature/dobutsu/aigo/2_data/pamph/h3009a/a-1b.pdf",
  "https://www.maff.go.jp/j/zyukyu/foodstock/",
  "https://disaportal.gsi.go.jp/",
  "https://www.bichiku.metro.tokyo.lg.jp/",
] as const;

export const DISCLAIMER =
  "Educational checklist built from public government guidance, not an official tool and not professional, engineering or safety advice. Not affiliated with the Disaster Management Agency (防災庁), the Cabinet Office, MLIT, MAFF, the Ministry of the Environment or any city. It does not inspect your building or predict disasters; follow your city's instructions and official alerts, and get a qualified 耐震診断 for building safety.";

export const BUILDING_TYPES = ["wood", "non_wood", "unknown"] as const;
export const TENURES = ["own", "rent"] as const;
export type BuildingType = (typeof BUILDING_TYPES)[number];
export type Tenure = (typeof TENURES)[number];
export type Verdict = "well_prepared" | "partly_prepared" | "not_prepared";
export type Era = "old_standard" | "likely_old" | "new_pre2000_wood" | "new_standard" | "unknown";
export type ItemStatus = "done" | "partial" | "todo";

export class RuleInputError extends Error {}

export const RULES = {
  minDays: 3,
  idealDays: 7,
  waterLitersPerPersonDay: 3,
  mealsPerPersonDay: 3,
  toiletUsesPerPersonDay: 5,
  petMinDays: 5,
  petIdealDays: 7,
  oldStandardBefore: "1981-06-01",
  woodSpecFrom: "2000-06-01",
  maxPersons: 30,
  maxDays: 30,
} as const;

export type PrepInput = {
  adults?: number;
  children?: number;
  infants?: number;
  elderly?: number;
  dogs?: number;
  cats?: number;
  days?: number;
  haveWaterLiters?: number | null;
  haveMeals?: number | null;
  haveToiletUses?: number | null;
  builtYear?: number | string | null;
  permitDate?: string | null;
  buildingType?: BuildingType;
  tenure?: Tenure;
  seismicDone?: boolean;
  furnitureFixed?: boolean;
  hazardMapChecked?: boolean;
  evacuationRouteChecked?: boolean;
  goBagReady?: boolean;
  drillJoined?: boolean;
};

export type Amount = { target: number; minimum3Days: number; have: number | null; gap: number | null; unit: string };
export type RequestItem = { n: 1 | 2 | 3 | 4 | 5; title: string; ja: string; status: ItemStatus; todo: string[] };

export type PrepResult = {
  verdict: Verdict;
  summary: string;
  doneCount: number;
  household: { adults: number; children: number; infants: number; elderly: number; persons: number; dogs: number; cats: number };
  days: number;
  stockpile: {
    water: Amount & { bottles2L: number };
    meals: Amount;
    toiletUses: Amount;
    pets: { foodAndWaterDays: number; minimumDays: number; note: string } | null;
    alsoStock: string[];
    rollingStock: string;
  };
  building: { era: Era; label: string; builtYear: number | null; permitDate: string | null; buildingType: BuildingType; tenure: Tenure; seismicDone: boolean; action: string };
  request: RequestItem[];
  links: { label: string; url: string }[];
  note: string;
  rulesAsOf: string;
  sources: readonly string[];
  disclaimer: string;
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;
export function validDate(s: string): boolean {
  if (!ISO.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

const ERAS: [RegExp, number][] = [
  [/^(令和|r)/i, 2018],
  [/^(平成|h)/i, 1988],
  [/^(昭和|s)/i, 1925],
  [/^(大正|t)/i, 1911],
];
/** "1979", 1979, "昭和54年", "S54", "平成元年", "H12" → Gregorian year. */
export function parseYear(raw: number | string): number {
  if (typeof raw === "number") {
    if (!Number.isInteger(raw)) throw new RuleInputError("builtYear must be a whole year like 1979 or 昭和54");
    return raw;
  }
  const t = raw.trim().normalize("NFKC").replace(/年$/, "").replace(/\s+/g, "");
  if (/^\d{4}$/.test(t)) return Number(t);
  for (const [re, base] of ERAS) {
    const m = t.match(re);
    if (m) {
      const rest = t.slice(m[0].length).replace(/^\./, "");
      const n = rest === "元" ? 1 : /^\d{1,2}$/.test(rest) ? Number(rest) : NaN;
      if (Number.isFinite(n) && n >= 1) return base + n;
    }
  }
  throw new RuleInputError(`builtYear "${raw}" not understood. Use a year like 1979, or 昭和54 / S54 / 平成12 / H12.`);
}

function count(v: number | undefined, name: string, dflt: number): number {
  const x = v ?? dflt;
  if (!Number.isInteger(x) || x < 0 || x > RULES.maxPersons) throw new RuleInputError(`${name} must be a whole number from 0 to ${RULES.maxPersons}`);
  return x;
}
function have(v: number | null | undefined, name: string): number | null {
  if (v === undefined || v === null) return null;
  if (!Number.isFinite(v) || v < 0) throw new RuleInputError(`${name} must be 0 or more`);
  return v;
}
function amount(perDay: number, days: number, h: number | null, unit: string): Amount {
  const target = perDay * days;
  return { target, minimum3Days: perDay * RULES.minDays, have: h, gap: h === null ? null : Math.max(0, Math.ceil((target - h) * 10) / 10), unit };
}

function classify(year: number | null, permit: string | null, type: BuildingType): Era {
  if (permit) {
    if (permit < RULES.oldStandardBefore) return "old_standard";
    if (type === "wood" && permit < RULES.woodSpecFrom) return "new_pre2000_wood";
    return "new_standard";
  }
  if (year === null) return "unknown";
  if (year <= 1980) return "old_standard";
  if (year === 1981) return "likely_old";
  if (type === "wood" && year <= 2000) return "new_pre2000_wood";
  return "new_standard";
}

const ERA_LABEL: Record<Era, string> = {
  old_standard: "Old quake standard (旧耐震, permitted before 1981-06-01)",
  likely_old: "Built in 1981 (昭和56年): could be old or new standard",
  new_pre2000_wood: "New standard (新耐震), wooden house from before the 2000 joint rules",
  new_standard: "New quake standard (新耐震, 1981-06-01 or later)",
  unknown: "Build year unknown",
};

export function checkPrep(input: PrepInput): PrepResult {
  const adults = count(input.adults, "adults", 1);
  const children = count(input.children, "children", 0);
  const infants = count(input.infants, "infants", 0);
  const elderly = count(input.elderly, "elderly", 0);
  const dogs = count(input.dogs, "dogs", 0);
  const cats = count(input.cats, "cats", 0);
  const persons = adults + children + infants + elderly;
  if (persons < 1) throw new RuleInputError("Household must have at least 1 person (adults, children, infants or elderly).");
  if (persons > RULES.maxPersons) throw new RuleInputError(`Household is capped at ${RULES.maxPersons} people.`);
  const days = input.days ?? RULES.idealDays;
  if (!Number.isInteger(days) || days < 1 || days > RULES.maxDays) throw new RuleInputError(`days must be a whole number from 1 to ${RULES.maxDays} (the request: at least 3, ideally 7).`);

  const buildingType = input.buildingType ?? "unknown";
  const tenure = input.tenure ?? "own";
  const permitDate = input.permitDate ?? null;
  if (permitDate && !validDate(permitDate)) throw new RuleInputError("permitDate must be a real date, YYYY-MM-DD (the 建築確認 date on the 確認済証).");
  let builtYear: number | null = input.builtYear === undefined || input.builtYear === null || input.builtYear === "" ? null : parseYear(input.builtYear);
  if (builtYear === null && permitDate) builtYear = Number(permitDate.slice(0, 4));
  if (builtYear !== null && (builtYear < 1868 || builtYear > 2030)) throw new RuleInputError("builtYear must be between 1868 and 2030.");
  const seismicDone = input.seismicDone ?? false;
  const era = classify(builtYear, permitDate, buildingType);

  const eaters = persons - infants;
  const water = { ...amount(RULES.waterLitersPerPersonDay * persons, days, have(input.haveWaterLiters, "haveWaterLiters"), "L"), bottles2L: Math.ceil((RULES.waterLitersPerPersonDay * persons * days) / 2) };
  const meals = amount(RULES.mealsPerPersonDay * eaters, days, have(input.haveMeals, "haveMeals"), "meals");
  const toiletUses = amount(RULES.toiletUsesPerPersonDay * eaters, days, have(input.haveToiletUses, "haveToiletUses"), "uses");
  const pets = dogs + cats > 0 ? { foodAndWaterDays: Math.max(RULES.petIdealDays, days), minimumDays: RULES.petMinDays, note: "Ministry of the Environment: pet food and water for at least 5 days, ideally 7 or more (relief supplies for pets can take 5+ days). Add any prescription food and medicine, a carrier or cage, spare leash, waste bags and vaccination records." } : null;

  const alsoStock = [
    "Toilet paper, tissues, wet wipes and garbage bags (the request names tissues and toilet paper)",
    "Separate non-drinking water for flushing and washing (e.g. keep the bath filled; the PM's Office says this is in addition to drinking water)",
    "Cassette stove with spare gas cylinders, flashlight, batteries, a phone power bank and a radio",
    "Regular medicines and a copy of your medicine notebook (お薬手帳), glasses, contact lens supplies",
  ];
  if (infants) alsoStock.push(`For ${infants} infant${infants > 1 ? "s" : ""}: formula or liquid milk (液体ミルク), bottles, diapers, baby food and wipes for ${days} days (not counted in meals or toilet uses above)`);
  if (elderly) alsoStock.push("For older family members: prescriptions, dentures and cleaner, soft or easy-to-eat food, adult diapers if used, and mobility aids");
  if (children) alsoStock.push("For children: familiar snacks and food they will eat, a small toy or book, and a family meeting point they know");
  alsoStock.push("Sanitary products, a whistle, slippers or shoes by the bed, cash in small notes and copies of IDs");

  const stockMet = (a: Amount, t: number) => a.have !== null && a.have >= t;
  const amounts = [water, meals, toiletUses].filter((a) => a.target > 0);
  const haveAny = amounts.some((a) => a.have !== null);
  const allFull = amounts.every((a) => stockMet(a, a.target));
  const allMin = amounts.every((a) => stockMet(a, a.minimum3Days));
  const s2: ItemStatus = allFull ? "done" : allMin || (haveAny && amounts.some((a) => stockMet(a, a.minimum3Days))) ? "partial" : "todo";

  const buildingOk = seismicDone || era === "new_standard";
  const furniture = input.furnitureFixed ?? false;
  const s1: ItemStatus = buildingOk && furniture ? "done" : buildingOk || furniture ? "partial" : "todo";
  const hm = input.hazardMapChecked ?? false;
  const route = input.evacuationRouteChecked ?? false;
  const s3: ItemStatus = hm && route ? "done" : hm || route ? "partial" : "todo";
  const s4: ItemStatus = input.goBagReady ? "done" : "todo";
  const s5: ItemStatus = input.drillJoined ? "done" : "todo";

  let buildingAction: string;
  if (seismicDone) buildingAction = "You've had a 耐震診断 / retrofit. Keep the report; re-check after major renovation.";
  else if (era === "old_standard") buildingAction = "Old-standard building: the request asks homes built in 昭和56年 (1981) or earlier to get a 耐震診断 (seismic diagnosis). Many cities subsidise diagnosis and retrofits; ask your city's 耐震 counter. If a full retrofit is too costly, the request suggests making at least the bedroom or living room safe.";
  else if (era === "likely_old") buildingAction = "The request says homes built in 昭和56年 (1981) or earlier should get a 耐震診断. The legal line is the 建築確認 date on the 確認済証: before 1981-06-01 = old standard. Check that date; if it's earlier or unknown, get a diagnosis.";
  else if (era === "new_pre2000_wood") buildingAction = "New standard, but wooden houses permitted before June 2000 predate the clarified joint and wall-balance rules. MLIT's 新耐震木造住宅検証法 has an owner self-check (所有者等による検証); if it doesn't pass, ask an expert.";
  else if (era === "new_standard") buildingAction = "Built to the 1981 new quake standard; the request does not ask for a diagnosis. Fixing furniture still matters.";
  else buildingAction = "Find the build year or the 建築確認 date (確認済証 / 検査済証, property tax notice or the 登記). Before 1981-06-01 = old standard → get a 耐震診断.";
  if (tenure === "rent" && !seismicDone && era !== "new_standard") buildingAction += " As a renter, ask your landlord or 管理会社 about the building's 耐震 status.";

  const t1: string[] = [];
  if (!buildingOk) t1.push(buildingAction);
  if (!furniture) t1.push(tenure === "rent" ? "Fix tall furniture and appliances: in a rental, ask about drilling or use tension poles, anti-tip plates and adhesive mats; keep tall furniture out of bedrooms and away from doors." : "Fix tall furniture and appliances to walls (L-brackets, tension poles, anti-tip plates); keep tall furniture out of bedrooms and away from doors. The request: unfixed furniture will fall in a big quake.");
  const t2: string[] = [];
  const line = (label: string, a: Amount) => (a.have === null ? `${label}: ${a.target} ${a.unit} for ${days} days (minimum ${a.minimum3Days} for 3 days)` : a.gap ? `${label}: ${a.gap} ${a.unit} more to reach ${a.target} for ${days} days` : null);
  for (const l of [line("Drinking water", water), line("Meals", meals), line("Portable-toilet uses", toiletUses)]) if (l) t2.push(l);
  if (!t2.length && !allFull) t2.push("Top up to the full amounts.");
  if (t2.length) t2.push("Rolling stock (ローリングストック): buy a little extra of what you already eat and replace it as you use it.");
  const t3: string[] = [];
  if (!hm) t3.push("Look up your home and workplace on the hazard map portal (重ねるハザードマップ) and your city's 揺れやすさマップ / 津波ハザードマップ.");
  if (!route) t3.push("Find your designated evacuation site (指定緊急避難場所) and walk the route once; the safe site can differ for quakes, floods and tsunami.");
  const t4 = s4 === "done" ? [] : ["Pack a grab bag (非常持ち出し品) with what you'd need right away: water, food, light, power bank, medicines, cash, ID copies, toiletries; keep it by the front door."];
  const t5 = s5 === "done" ? [] : ["Join your neighbourhood or city drill (防災訓練): practise evacuating, safety checks, cooking outdoors and using a portable toilet. Try the 171 disaster message dial on the 1st or 15th of a month."];

  const request: RequestItem[] = [
    { n: 1, title: "Quake-check the house and fix furniture", ja: "家屋の耐震診断、耐震化、家具の固定", status: s1, todo: t1 },
    { n: 2, title: "Stock water, food and portable toilets", ja: "水・食料、携帯用トイレ等の備蓄", status: s2, todo: t2 },
    { n: 3, title: "Check hazard maps, evacuation site and route", ja: "ハザードマップ、避難場所、避難経路の確認", status: s3, todo: t3 },
    { n: 4, title: "Prepare a grab bag", ja: "非常持ち出し品の準備", status: s4, todo: t4 },
    { n: 5, title: "Join a disaster drill", ja: "防災訓練への参加", status: s5, todo: t5 },
  ];
  const doneCount = request.filter((r) => r.status === "done").length;
  const partial = request.filter((r) => r.status === "partial").length;
  const verdict: Verdict = doneCount === 5 ? "well_prepared" : doneCount + partial >= 3 ? "partly_prepared" : "not_prepared";

  const who = `${persons} ${persons === 1 ? "person" : "people"}${dogs + cats ? ` + ${dogs + cats} pet${dogs + cats > 1 ? "s" : ""}` : ""}`;
  const summary = `${doneCount} of 5 done. For ${who}, ${days} days: ${water.target} L water (${water.bottles2L} × 2 L), ${meals.target} meals, ${toiletUses.target} toilet uses.${era === "old_standard" || era === "likely_old" ? " Get a 耐震診断." : ""}`;

  return {
    verdict,
    summary,
    doneCount,
    household: { adults, children, infants, elderly, persons, dogs, cats },
    days,
    stockpile: { water, meals, toiletUses, pets, alsoStock, rollingStock: "Store what you normally eat and drink, a bit extra, and replace it as you use it (ローリングストック), as the request and MAFF suggest." },
    building: { era, label: ERA_LABEL[era], builtYear, permitDate, buildingType, tenure, seismicDone, action: buildingAction },
    request,
    links: [
      { label: "Hazard map portal (重ねるハザードマップ / わがまちハザードマップ)", url: "https://disaportal.gsi.go.jp/" },
      { label: "PM's Office: preparing at home (災害への備え)", url: "https://www.kantei.go.jp/jp/headline/bousai/sonae.html" },
      { label: "MAFF home food stockpile portal (家庭備蓄ポータル)", url: "https://www.maff.go.jp/j/zyukyu/foodstock/" },
      { label: "MLIT housing seismic retrofit (住宅・建築物の耐震化)", url: "https://www.mlit.go.jp/jutakukentiku/house/jutakukentiku_house_fr_000043.html" },
      { label: "Tokyo Stockpile Navi (東京備蓄ナビ)", url: "https://www.bichiku.metro.tokyo.lg.jp/" },
    ],
    note: "The request (2026-11-02) is a standing call to prepare, not a warning about a specific disaster; the minister said on 2026-10-30 that it is not based on any prediction.",
    rulesAsOf: RULES_AS_OF,
    sources: SOURCES,
    disclaimer: DISCLAIMER,
  };
}
