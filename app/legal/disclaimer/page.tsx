import type { Metadata } from "next";
import { DISCLAIMER, RULES_AS_OF, SOURCES } from "@/lib/prep";
import { DISCLAIMER_SHORT, HONESTY } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimer", description: DISCLAIMER_SHORT };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Read this</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Disclaimer</h1>
      <p className="mt-4 text-lg text-foreground">{DISCLAIMER_SHORT}</p>
      <p className="mt-2 text-muted">{HONESTY}</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">What this is</h2>
          <p className="mt-2">
            A free educational checklist. It turns the five points of the 防災大臣&apos;s 「事前防災徹底のための緊急要請」 (2026-11-02) into a household to-do list, using a dated reading (as of {RULES_AS_OF}) of the request text, the Prime Minister&apos;s Office 「災害への備え」 page (drinking water 3 L per person per day, 3 days minimum, 1 week for large disasters), 防災庁 / METI portable-toilet guidance (5 uses per person per day), MLIT seismic pages (旧耐震 = 建築確認 before 1981-06-01; 新耐震木造住宅検証法 for wooden houses from 1981-06-01 to 2000-05-31) and the Ministry of the Environment pet pamphlet (pet food and water at least 5 days, ideally 7+).
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">What it isn&apos;t</h2>
          <p className="mt-2">{DISCLAIMER}</p>
          <p className="mt-2">
            The amounts are rules of thumb, not a guarantee: hot weather, illness, babies, older people and pets can need more. A build year is only a first filter; only a qualified 耐震診断 tells you how strong a building is. The 2026-11-02 request is a standing call to prepare and is not a warning about any specific disaster. In an emergency, follow official alerts (J-ALERT, 気象庁) and your city&apos;s evacuation instructions.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {SOURCES.map((s) => (
              <li key={s}>
                <a href={s} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Your data</h2>
          <p className="mt-2">What you enter stays in your browser (or in a share link you create). No login, no names, no addresses, no database.</p>
        </section>
      </div>
    </div>
  );
}
