// how we measure impact: the method behind every figure, after the tracker and before the footer.
// The impact section and a tracked order both link here (#how-we-measure).

import { HEALTH_TIER_SOURCE } from "@/components/statsData";

// tiers run from 1 (highest health impact, score 4) to 4 (lowest, score 1); the badge darkens with the score
const HEALTH_TIERS = [
  { tier: 1, score: 4, title: "Critical and high impact", examples: "Immediate life-saving care and intervention", badge: "bg-brand-blue text-white" },
  { tier: 2, score: 3, title: "High to moderate impact", examples: "Diagnostics and disease monitoring", badge: "bg-brand-blue/75 text-white" },
  { tier: 3, score: 2, title: "Moderate impact", examples: "Infection control and delivery systems", badge: "bg-brand-blue/45 text-white" },
  { tier: 4, score: 1, title: "Low-risk, high utility impact", examples: "Mobility, wound care and rehabilitation", badge: "bg-brand-blue/15 text-brand-blue" },
];

const ENVIRONMENTAL_FORMULAS = [
  { name: "Units delivered", formula: "Quantity ordered × units in one pack" },
  { name: "Weight kept out of landfill", formula: "Units delivered × weight of one unit" },
  { name: "CO₂e emissions avoided", formula: "Units delivered × CO₂e figure for one unit" },
];

export default function HowWeMeasure() {
  return (
    <section id="how-we-measure" className="bg-white px-6 py-16 font-sans text-brand-blue">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-red">Behind the numbers</p>
          <h2 className="mt-2 text-[clamp(1.9rem,3.4vw,3.4rem)] font-bold leading-[1.1] tracking-[-0.04em]">
            How we measure impact
          </h2>
          <p className="mt-4 text-[clamp(1rem,1.5vw,1.25rem)] text-brand-blue/85">
            Every figure on this page is worked out from the items in each delivery, the same way every time.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl bg-surface-cream p-6">
            <h3 className="text-xl font-bold">Health impact</h3>
            <p className="mt-2 leading-relaxed text-slate-700">
              Every item is placed in a tier by the part it plays in care. An order&apos;s score is the average of
              its items&apos; scores, weighted by quantity, out of 4.
            </p>
            <ol className="mt-5 space-y-4">
              {HEALTH_TIERS.map((tier) => (
                <li key={tier.score} className="flex items-start gap-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${tier.badge}`}
                    aria-label={`Score ${tier.score}`}
                  >
                    {tier.score}
                  </span>
                  <div>
                    <p className="font-semibold">
                      Tier {tier.tier}: {tier.title}
                    </p>
                    <p className="text-sm text-slate-600">{tier.examples}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-sm text-slate-600">
              An order is rated High with a score of 3 or more, Medium from 2 to under 3, and Low under 2.
            </p>
            {/* where the tiers come from; worded by the team, so keep it as written */}
            <p className="mt-5 border-t border-brand-blue/15 pt-5 text-sm leading-relaxed text-slate-700">
              The health impact tiering was derived from the TGA&apos;s medical device classification framework,
              which groups devices into four classes (Class I, IIa, IIb and III). Where the TGA classifies devices
              by their level of risk to patients, this scheme adapts the same four-tier structure to classify items
              by their level of health impact, from immediate life-saving intervention (Tier 1) to mobility, wound
              care and rehabilitation (Tier 4).
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Source:{" "}
              <a
                href={HEALTH_TIER_SOURCE.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-red underline underline-offset-4 hover:no-underline"
              >
                {HEALTH_TIER_SOURCE.title}
              </a>
              , {HEALTH_TIER_SOURCE.publisher}
            </p>
          </article>

          <article className="rounded-2xl bg-surface-cream p-6">
            <h3 className="text-xl font-bold">Environmental impact</h3>
            <p className="mt-2 leading-relaxed text-slate-700">
              Worked out for each item from its pack size, weight and CO₂e figure, then added up across the order.
            </p>
            <dl className="mt-5 space-y-3">
              {ENVIRONMENTAL_FORMULAS.map((row) => (
                <div key={row.name} className="rounded-xl bg-white px-4 py-3">
                  <dt className="font-semibold">{row.name}</dt>
                  <dd className="mt-0.5 text-slate-700">{row.formula}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm text-slate-600">
              Items with no recorded weight or CO₂e figure are left out, and only completed orders are counted.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

