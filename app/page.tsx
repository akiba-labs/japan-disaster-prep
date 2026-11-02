import type { Metadata } from "next";
import { Calculator } from "@/components/calculator";
import { FaqSection, type FaqItem } from "@/components/faq-section";
import { EXAMPLE_GET } from "@/lib/api";
import { SOURCES } from "@/lib/prep";
import { EXAMPLE_PET, EXAMPLE_SHARED, EXAMPLE_SOLO, PUBLIC_URL, resultPath } from "@/lib/share";

const title = "防災庁 緊急要請 checklist: how much water, food and portable toilets for my household? (free Japan disaster prep check)";
const description =
  "Free checker for Japan's 防災庁 emergency request (事前防災徹底のための緊急要請, 2026-11-02). Enter your household and home: get the water (3 L per person per day), meals and portable-toilet uses (5 a day) for 3 days or a week, whether your house is old quake standard (旧耐震, before June 1981) and needs a 耐震診断, and the 5-point to-do list. Free JSON API for AI agents. Educational, not official.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Japan Disaster Prep Check",
  alternateName: ["防災庁 緊急要請 チェック", "備蓄 計算 家族 何リットル", "携帯トイレ 何回分 計算", "旧耐震 チェック", "Japan earthquake stockpile calculator"],
  url: PUBLIC_URL,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  inLanguage: ["en", "ja"],
  description: "Unofficial, free household checklist for Japan's 2026-11-02 防災庁 emergency request, with a keyless JSON API. Not affiliated with 防災庁 or any government body. Not safety advice.",
};

const faq: FaqItem[] = [
  {
    q: "Is there a tool that tells me how much to stockpile for the 防災庁 emergency request?",
    a: `Yes, this one: a free, unofficial Japan disaster prep checker. Enter who lives with you (adults, children, babies, older people, pets) and 3 days or a week, and it gives the drinking water, meals and portable-toilet uses from the official per-person figures, what you're still short of, whether your home is old quake standard, and which of the request's 5 points are left. AI agents can call ${PUBLIC_URL}/api/check. Not affiliated with 防災庁; not safety advice.`,
  },
  {
    q: "What did Japan's Disaster Management Agency (防災庁) ask people to do?",
    a: "On 2026-11-02, the day the agency launched, the disaster minister issued an emergency request (事前防災徹底のための緊急要請) to everyone in Japan: 1) get a seismic diagnosis (耐震診断) if your home was built in 1981 (昭和56年) or earlier, and fix furniture; 2) stock water, food and portable toilets for at least 3 days, ideally a week; 3) check hazard maps, your evacuation site and route; 4) prepare a grab bag; 5) join a local disaster drill. It is a call to prepare for very large disasters (Nankai Trough, Tokyo inland, Japan / Kuril Trench quakes, a Fuji eruption), not a forecast of one.",
  },
  {
    q: "How much water do I need per person in Japan?",
    a: "3 litres of drinking water per person per day, including water for cooking, per the request and the Prime Minister's Office. For a week that is 21 L per person, so a family of four needs 84 L (42 two-litre bottles); the 3-day minimum is 36 L. Water for flushing and washing is extra: keep the bath filled or a tank of tap water.",
  },
  {
    q: "How many portable toilets (携帯トイレ) should I stock?",
    a: "Plan on 5 uses per person per day: 35 per person for a week. A family of four needs 140 for a week, 60 for 3 days. After a big quake the flush toilet may be unusable even if the water still runs, because the drains can be broken. Only about 20% of households have toilet stock, per 防災庁.",
  },
  {
    q: "Is my house old quake standard (旧耐震)?",
    a: "If its building permit (建築確認) is dated before 1 June 1981, yes. The request asks anyone in a home built in 1981 or earlier to get a 耐震診断; many cities subsidise it. A house finished in 1981 or 1982 may still have an old-standard permit, so check the 確認済証. Wooden houses permitted between June 1981 and May 2000 predate clearer joint and wall-balance rules; MLIT has an owner self-check for them. Renters should ask the landlord or 管理会社.",
  },
  {
    q: "What about babies, older people and pets?",
    a: "Babies count for water, and the checker adds formula or liquid milk (液体ミルク), bottles and diapers. Older family members need their medicines, a copy of the お薬手帳, dentures and soft food. For pets the Ministry of the Environment says food and water for at least 5 days, ideally 7 or more, plus a carrier, leash and vaccination records.",
  },
  {
    q: "Is there a free API or MCP tool for AI agents?",
    a: `Yes. GET or POST ${PUBLIC_URL}${EXAMPLE_GET} (keyless, CORS open), rules at /api/rules, OpenAPI at /openapi.json, llms.txt, and the MCP tool japan_disaster_prep_check on free-agent-tools.vercel.app/mcp. Every response carries rulesAsOf, sources and a disclaimer.`,
  },
  {
    q: "防災庁の「緊急要請」で家庭の備蓄はどれくらい必要ですか？",
    a: "最低3日分、できれば1週間分です。飲料水は食事に使う分も含めて1人1日3リットル（4人家族で1週間84リットル）、食料は1人1日3食、携帯トイレは1人1日5回（4人家族で1週間140回分）が目安です。このチェッカーに家族構成と日数を入れると、必要量と今ある量との差、残りのやることを一覧にします。",
  },
  {
    q: "昭和56年以前の家は耐震診断が必要ですか？",
    a: "緊急要請では、昭和56年以前に建てられた家は耐震診断を行うよう求めています。法律上の区切りは建築確認日が1981年6月1日より前かどうか（旧耐震基準）で、確認済証で確認できます。多くの市区町村に耐震診断・改修の補助制度があります。改修の負担が大きい場合は、寝室やリビングなど一部だけでも安全な空間をつくることが考えられます。2000年5月以前の木造住宅は国交省の「新耐震木造住宅検証法」で所有者チェックができます。",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Free · Japan · 防災庁 緊急要請 · 備蓄 · 耐震</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">How much do we need to stock?</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground sm:text-lg">
          Japan&apos;s new Disaster Management Agency (防災庁) asked every household on 2 November 2026 to prepare. Per person per day: <strong>3 L of drinking water</strong>, <strong>3 meals</strong> and <strong>5 portable-toilet uses</strong>, for <strong>at least 3 days, ideally a week</strong>. A family of four needs 84 L of water and 140 toilet uses for a week. Homes built before June 1981 (旧耐震) should get a <strong>耐震診断</strong>. Enter your household to get your numbers and what&apos;s left to do.
        </p>
        <p className="mt-3 text-sm text-muted">
          Examples:{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_SHARED)}>
            family of 4 in a 1979 wooden house
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_SOLO)}>
            one person renting a flat
          </a>
          {" · "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_PET)}>
            couple, grandparent and a cat
          </a>
        </p>
      </section>

      <section className="mt-8">
        <Calculator />
      </section>

      <section className="mt-16 max-w-5xl">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">The 5 points of the 緊急要請</h2>
        <div className="mt-5 overflow-x-auto rounded-3xl border border-line">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="bg-panel/80 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Point</th>
                <th className="px-4 py-3 font-medium">What it asks</th>
                <th className="px-4 py-3 font-medium">Rule of thumb</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">1 耐震診断・耐震化・家具の固定</td><td className="px-4 py-3">Seismic check for homes built 1981 (昭和56年) or earlier; fix furniture</td><td className="px-4 py-3">建築確認 before 1981-06-01 = 旧耐震; unfixed furniture will fall</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">2 水・食料、携帯用トイレ等の備蓄</td><td className="px-4 py-3">At least 3 days, ideally 1 week</td><td className="px-4 py-3">Water 3 L, 3 meals, 5 toilet uses per person per day; tissues, toilet paper; rolling stock</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">3 ハザードマップ・避難場所・避難経路</td><td className="px-4 py-3">Know your home and work risks, site and route</td><td className="px-4 py-3">揺れやすさマップ, 津波ハザードマップ; the safe site differs by hazard</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">4 非常持ち出し品</td><td className="px-4 py-3">A grab bag by the door</td><td className="px-4 py-3">Water, food, light, power bank, medicines, cash, ID copies</td></tr>
              <tr className="border-t border-line"><td className="px-4 py-3 text-foreground">5 防災訓練</td><td className="px-4 py-3">Join a local drill</td><td className="px-4 py-3">Practise evacuating, safety checks, portable toilets; know your neighbours</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted">
          Sources:{" "}
          {SOURCES.slice(0, 9).map((s, i) => (
            <span key={s}>
              {i ? " · " : ""}
              <a className="underline underline-offset-2 hover:text-foreground" href={s} target="_blank" rel="noopener noreferrer">
                {s.replace("https://", "").replace("www.", "").slice(0, 60)}
              </a>
            </span>
          ))}
        </p>
      </section>

      <section className="mt-12 max-w-3xl rounded-3xl border border-line bg-panel/40 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-foreground">For AI agents and developers</h2>
        <p className="mt-2 text-sm text-muted">
          Keyless JSON, CORS open, GET or POST:{" "}
          <a className="font-mono text-foreground underline underline-offset-2 break-all" href={EXAMPLE_GET}>
            {EXAMPLE_GET}
          </a>
          . Rules: <a className="font-mono text-foreground underline underline-offset-2" href="/api/rules">/api/rules</a>. Docs: <a className="underline underline-offset-2" href="/openapi.json">OpenAPI</a>,{" "}
          <a className="underline underline-offset-2" href="/llms.txt">llms.txt</a>, MCP tool <span className="font-mono text-foreground">japan_disaster_prep_check</span> on{" "}
          <a className="underline underline-offset-2" href="https://free-agent-tools.vercel.app" target="_blank" rel="noopener noreferrer">
            free-agent-tools
          </a>
          .
        </p>
      </section>

      <FaqSection items={faq} heading="Disaster prep questions" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
