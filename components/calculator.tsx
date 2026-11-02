"use client";

import { useState } from "react";
import { CardDisclaimer } from "@/components/card-disclaimer";
import { ShareBar } from "@/components/share-bar";
import type { BuildingType, Tenure } from "@/lib/prep";
import { EXAMPLE_SHARED, PUBLIC_URL, resultPath, safeCheck, type Shared } from "@/lib/share";
import { STATUS_LABEL, STATUS_STYLE, VERDICT_LABEL, VERDICT_STYLE } from "@/lib/verdict";

const field = "mt-2 w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-sm text-foreground focus:border-amber";

function Num({ label, value, set, testid, min = 0, max = 30 }: { label: string; value: number; set: (v: number) => void; testid?: string; min?: number; max?: number }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <input data-testid={testid} type="number" inputMode="numeric" min={min} max={max} className={field} value={value} onChange={(e) => set(Math.max(min, Math.min(max, Math.floor(Number(e.target.value) || 0))))} />
    </label>
  );
}
function OptNum({ label, value, set, testid }: { label: string; value: number | null; set: (v: number | null) => void; testid?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input data-testid={testid} type="number" inputMode="decimal" min={0} className={field} value={value ?? ""} placeholder="—" onChange={(e) => set(e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0))} />
    </label>
  );
}
function Check({ label, value, set, testid }: { label: string; value: boolean; set: (v: boolean) => void; testid?: string }) {
  return (
    <label className="mt-3 flex items-start gap-2 text-sm text-foreground">
      <input data-testid={testid} type="checkbox" className="mt-1" checked={value} onChange={(e) => set(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function Calculator({ initial }: { initial?: Shared }) {
  const [s, setS] = useState<Shared>(initial ?? EXAMPLE_SHARED);
  const set = <K extends keyof Shared>(k: K) => (v: Shared[K]) => setS((p) => ({ ...p, [k]: v }));
  const persons = s.adults + s.children + s.infants + s.elderly;
  const r = persons > 0 ? safeCheck(s) : null;
  const shareUrl = `${PUBLIC_URL}${resultPath(s)}`;
  const year = s.builtYear === null ? "" : String(s.builtYear);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.3fr]">
      <div className="rounded-3xl border border-line bg-panel/60 p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Your household · 世帯</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Num label="Adults 大人" value={s.adults} set={set("adults")} testid="adults" />
          <Num label="Children 子ども" value={s.children} set={set("children")} testid="children" />
          <Num label="Babies 乳児" value={s.infants} set={set("infants")} testid="infants" />
          <Num label="Elderly 高齢者" value={s.elderly} set={set("elderly")} testid="elderly" />
          <Num label="Dogs 犬" value={s.dogs} set={set("dogs")} />
          <Num label="Cats 猫" value={s.cats} set={set("cats")} />
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-foreground">Stock for</span>
          <select data-testid="days" className={field} value={s.days} onChange={(e) => set("days")(Number(e.target.value))}>
            <option value={3}>3 days (minimum, 最低3日)</option>
            <option value={7}>1 week (ideal, できれば1週間)</option>
            <option value={10}>10 days</option>
            <option value={14}>2 weeks</option>
          </select>
        </label>
        <p className="mt-4 text-sm font-medium text-foreground">What you already have (optional)</p>
        <div className="mt-1 grid grid-cols-3 gap-3">
          <OptNum label="Water (L)" value={s.haveWaterLiters} set={set("haveWaterLiters")} testid="have-water" />
          <OptNum label="Meals" value={s.haveMeals} set={set("haveMeals")} testid="have-meals" />
          <OptNum label="Toilet bags" value={s.haveToiletUses} set={set("haveToiletUses")} testid="have-toilet" />
        </div>
        <p className="mt-5 font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Your home · 住まい</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-medium text-foreground">Year built 築年</span>
            <input data-testid="year" type="number" inputMode="numeric" min={1868} max={2030} placeholder="e.g. 1979" className={field} value={year} onChange={(e) => set("builtYear")(e.target.value === "" ? null : Number(e.target.value))} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-foreground">Structure 構造</span>
            <select data-testid="type" className={field} value={s.buildingType} onChange={(e) => set("buildingType")(e.target.value as BuildingType)}>
              <option value="unknown">Not sure</option>
              <option value="wood">Wooden house (木造)</option>
              <option value="non_wood">Concrete / steel (マンション etc.)</option>
            </select>
          </label>
        </div>
        <label className="mt-3 block">
          <span className="text-xs font-medium text-muted">建築確認 date on the 確認済証 (optional, exact)</span>
          <input data-testid="permit" type="date" className={field} value={s.permitDate ?? ""} onChange={(e) => set("permitDate")(e.target.value || null)} />
        </label>
        <label className="mt-3 block">
          <span className="text-xs font-medium text-foreground">You</span>
          <select className={field} value={s.tenure} onChange={(e) => set("tenure")(e.target.value as Tenure)}>
            <option value="own">Own it (持ち家)</option>
            <option value="rent">Rent (賃貸)</option>
          </select>
        </label>
        <p className="mt-5 font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Done already · 実施済み</p>
        <Check label="耐震診断 passed / retrofitted" value={s.seismicDone} set={set("seismicDone")} testid="seismic" />
        <Check label="Tall furniture fixed (家具の固定)" value={s.furnitureFixed} set={set("furnitureFixed")} testid="furniture" />
        <Check label="Checked the hazard map (ハザードマップ)" value={s.hazardMapChecked} set={set("hazardMapChecked")} testid="hazard" />
        <Check label="Know my evacuation site and route (避難場所・避難経路)" value={s.evacuationRouteChecked} set={set("evacuationRouteChecked")} testid="route" />
        <Check label="Grab bag packed (非常持ち出し品)" value={s.goBagReady} set={set("goBagReady")} testid="gobag" />
        <Check label="Joined a disaster drill (防災訓練)" value={s.drillJoined} set={set("drillJoined")} testid="drill" />
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-line bg-panel/60">
        <div className="p-5 sm:p-7" data-testid="result">
          {r ? (
            <>
              <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
                {VERDICT_LABEL[r.verdict]} · {r.doneCount}/5 · {r.household.persons} {r.household.persons === 1 ? "person" : "people"} · {r.days} days
              </p>
              <p className={`mt-2 font-display text-3xl leading-tight tracking-tight sm:text-4xl ${VERDICT_STYLE[r.verdict]}`}>{r.summary}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { k: "Drinking water 飲料水", a: r.stockpile.water, extra: `${r.stockpile.water.bottles2L} × 2 L bottles` },
                  { k: "Meals 食料", a: r.stockpile.meals, extra: "3 a day per person" },
                  { k: "Toilet uses 携帯トイレ", a: r.stockpile.toiletUses, extra: "5 a day per person" },
                ].map(({ k, a, extra }) => (
                  <div key={k} className="rounded-2xl border border-line p-3">
                    <p className="text-xs text-muted">{k}</p>
                    <p className="mt-1 font-mono text-2xl text-foreground">
                      {a.target} <span className="text-sm text-muted">{a.unit}</span>
                    </p>
                    <p className="text-xs text-muted">{extra} · min 3 days: {a.minimum3Days}</p>
                    {a.gap !== null ? <p className={`mt-1 text-xs ${a.gap ? "text-amber-200" : "text-teal-200"}`}>{a.gap ? `Need ${a.gap} more` : "Covered"}</p> : null}
                  </div>
                ))}
              </div>
              {r.stockpile.pets ? <p className="mt-3 text-sm text-muted">Pets: food and water for {r.stockpile.pets.foodAndWaterDays} days (at least {r.stockpile.pets.minimumDays}).</p> : null}
              <div className="mt-6 rounded-2xl border border-line p-4">
                <p className="text-sm font-semibold text-foreground">Home: {r.building.label}</p>
                <p className="mt-1 text-sm text-muted">{r.building.action}</p>
              </div>
              <h3 className="mt-6 text-sm font-semibold text-foreground">The 5 points of the 緊急要請</h3>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
                {r.request.map((i) => (
                  <li key={i.n} className="rounded-2xl border border-line p-3" data-testid={`item-${i.n}`}>
                    <p className="text-foreground">
                      <span className={`mr-2 font-mono ${STATUS_STYLE[i.status]}`}>{STATUS_LABEL[i.status]}</span>
                      {i.n}. {i.title} <span className="text-xs text-muted">· {i.ja}</span>
                    </p>
                    {i.todo.length ? (
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">
                        {i.todo.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
              <h3 className="mt-6 text-sm font-semibold text-foreground">Also stock</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                {r.stockpile.alsoStock.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">
                {r.links.slice(0, 3).map((l, i) => (
                  <span key={l.url}>
                    {i ? " · " : ""}
                    <a className="underline underline-offset-2 hover:text-foreground" href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  </span>
                ))}
              </p>
              <p className="mt-3 text-xs text-muted">{r.note}</p>
              <div className="mt-6">
                <ShareBar url={shareUrl} text={`My 防災 check: ${r.summary}`} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Add at least one person to the household. Year built must be between 1868 and 2030.</p>
          )}
        </div>
        <CardDisclaimer />
      </div>
    </div>
  );
}
