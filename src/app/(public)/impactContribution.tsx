// our impact/contribution

import Image from 'next/image';
import { ImpactContributionStatCard, ImpactCategoryRow } from '@/components/ui/ui';
import ReachMapLoader from '@/components/maps/reachMapLoader';
import type { ReachPoint } from '@/components/maps/reachMap';
import { ORIGIN } from '@/lib/config/origin';
import { HEALTH_TIER_SOURCE } from '@/components/statsData';
import { regionName } from '@/lib/regionNames';
import { getImpactReport } from '@/lib/api/server';
import { formatCategory, formatCount, formatWeight } from '@/lib/format';

const HEALTH_SCORE_LABELS: Record<number, string> = {
  4: 'Critical and high impact',
  3: 'High to moderate impact',
  2: 'Moderate impact',
  1: 'Low-risk, high utility impact',
};

// byLocation has no country, so a place counts as Australian when its state is one of these
const AUSTRALIAN_STATES = new Set(['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']);

const plural = (n: number, one: string, many: string) => `${formatCount(n)} ${n === 1 ? one : many}`;

export default async function ImpactContribution() {
  const report = await getImpactReport();
  const locationCount = String(report?.byRecipient.length ?? 0);
  const itemsSavedCount = String(report?.overall.totalItems ?? 0);
  const totalDonationsCount = String(report?.overall.totalDonations ?? 0);

  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  const donationsLastMonthCount = String(
    report?.byMonth.find((m) => m.month === lastMonthKey)?.totalDonations ?? 0
  );

  const impactStats = [
    {
      value: locationCount,
      label: 'organisations have received supplies',
    },
    {
      value: itemsSavedCount,
      label: 'medical items given a second life instead of going to landfill',
    },
    {
      value: totalDonationsCount,
      label: 'deliveries made',
    },
    // a zero here reads as nothing happening, so the card is left out for a quiet month
    ...(donationsLastMonthCount !== '0'
      ? [{ value: donationsLastMonthCount, label: 'deliveries made last month' }]
      : []),
  ];

  // categories sorted by CO2e avoided, each shown as a share of the total
  const categories = report?.byCategory.filter((c) => c.totalCO2eAvoidedKg > 0) ?? [];
  const totalCO2e = categories.reduce((sum, c) => sum + c.totalCO2eAvoidedKg, 0);
  const categoryRows = categories
    .toSorted((a, b) => b.totalCO2eAvoidedKg - a.totalCO2eAvoidedKg)
    .map((c) => {
      const weight = formatWeight(c.totalCO2eAvoidedKg);
      return {
        category: formatCategory(c.category),
        value: `${weight.value} ${weight.unit}`,
        percent: (c.totalCO2eAvoidedKg / totalCO2e) * 100,
      };
    });

  // orders by health impact score, highest score first, each shown as a share of all scored orders
  const ordersByScore = new Map<number, number>();
  for (const s of report?.byHealthImpactScore ?? []) {
    const score = Math.round(s.score);
    ordersByScore.set(score, (ordersByScore.get(score) ?? 0) + s.totalDonations);
  }
  const healthScores = [...ordersByScore].filter(([, orders]) => orders > 0);
  const totalScoredOrders = healthScores.reduce((sum, [, orders]) => sum + orders, 0);
  const healthRows = healthScores
    .toSorted(([a], [b]) => b - a)
    .map(([score, orders]) => ({
      label: HEALTH_SCORE_LABELS[score]
        ? `Score ${score}: ${HEALTH_SCORE_LABELS[score]}`
        : `Score ${score}`,
      value: orders.toLocaleString('en-AU'),
      percent: (orders / totalScoredOrders) * 100,
    }));

  // every place supplies have reached, labelled by place only; recipients are not named
  const reachPoints: ReachPoint[] = (report?.byLocation ?? []).flatMap((l) =>
    l.lat != null && l.lng != null
      ? [{
          lat: l.lat,
          lng: l.lng,
          items: l.totalItems,
          label: `${[l.city, regionName(l.state)].filter(Boolean).join(', ')}: ${plural(l.totalDonations, 'delivery', 'deliveries')}, ${plural(l.totalItems, 'item', 'items')}`,
        }]
      : []
  );
  const australianPlaces = (report?.byLocation ?? []).filter((l) => l.state && AUSTRALIAN_STATES.has(l.state.toUpperCase())).length;
  const overseasPlaces = (report?.byLocation.length ?? 0) - australianPlaces;
  const reachOrigin = {
    lat: ORIGIN.lat!,
    lng: ORIGIN.lng!,
    label: `${ORIGIN.organisation} (${ORIGIN.city})`,
  };

  return (
    <section id="impact" className="impact-contribution">
      <div className="impact-contribution__header">
        <div className="impact-contribution__copy">
          <h2 className="impact-contribution__title">Where your support goes</h2>

          <p className="impact-contribution__paragraph">
            Every number below is a real box of supplies, packed by volunteers and
            delivered to someone who needed it.
          </p>

          <p className="impact-contribution__paragraph">
            None of it happens without the donors, sponsors and volunteers behind it.
          </p>
        </div>

        <div className="impact-contribution__hero">
          <Image
            src="/images/boxPacking.png"
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            loading="eager"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>

      <div className="impact-contribution__summary">
        <h2 className="impact-contribution__summary-title">
          What it has added up to so far
        </h2>

        <div className="impact-contribution__grid">
          <div className="impact-contribution__visual">
            <Image
              src="/images/medSupplies.jpg"
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>

          <div className="impact-contribution__list">
            {impactStats.map((stat, index) => (
              <ImpactContributionStatCard
                key={`${stat.value}-${index}`}
                value={stat.value}
                label={stat.label}
                icon="/images/heartIcon.png"
              />
            ))}
          </div>
        </div>
      </div>

      {reachPoints.length > 0 ? (
        <div className="impact-breakdown">
          <h2 className="impact-contribution__summary-title">Everywhere supplies have reached</h2>

          <p className="impact-contribution__paragraph">
            {plural(australianPlaces, 'place', 'places')} across Australia
            {overseasPlaces > 0 ? <>, and {plural(overseasPlaces, 'place', 'places')} overseas</> : null}, all
            supplied from our base in {ORIGIN.city}. 
          </p>

          <div className="impact-contribution__map">
            <ReachMapLoader origin={reachOrigin} points={reachPoints} />
          </div>
        </div>
      ) : null}

      {healthRows.length > 0 ? (
        <div className="impact-breakdown">
          <div className="impact-contribution__grid impact-contribution__grid--visual-right">
            <div>
              <h2 className="impact-contribution__summary-title">Health Impacts</h2>

              <p className="impact-contribution__paragraph">
                Each delivery is scored by how important its supplies are to patient care,
                from everyday care to life-saving.
              </p>

              <ul className="impact-breakdown__list">
                {healthRows.map((row) => (
                  <ImpactCategoryRow
                    key={row.label}
                    category={row.label}
                    value={row.value}
                    percent={row.percent}
                    unit="orders"
                  />
                ))}
              </ul>

              <p className="mt-6 text-base text-brand-blue/80">
                Source:{' '}
                <a
                  href={HEALTH_TIER_SOURCE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-red underline underline-offset-4 hover:no-underline"
                >
                  {HEALTH_TIER_SOURCE.title}
                </a>
                , {HEALTH_TIER_SOURCE.publisher}
                {' · '}
                <a href="#how-we-measure" className="font-semibold text-brand-red underline underline-offset-4 hover:no-underline">
                  How we measure this
                </a>
              </p>
            </div>

            <div className="impact-contribution__visual">
              <Image
                src="/images/image2.jpg"
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {categoryRows.length > 0 ? (
        <div className="impact-breakdown">
          <div className="impact-contribution__grid">
            <div className="impact-contribution__visual">
              <Image
                src="/images/image1.jpg"
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>

            <div>
              <h2 className="impact-contribution__summary-title">
                Environmental Impacts
              </h2>

              <p className="impact-contribution__paragraph">
                Share of CO<sub>2</sub>e emissions avoided by each category of supplies.
              </p>

              <ul className="impact-breakdown__list">
                {categoryRows.map((row) => (
                  <ImpactCategoryRow
                    key={row.category}
                    category={row.category}
                    value={row.value}
                    percent={row.percent}
                  />
                ))}
              </ul>

              <p className="mt-6 text-base text-brand-blue/80">
                <a href="#how-we-measure" className="font-semibold text-brand-red underline underline-offset-4 hover:no-underline">
                  How we measure this
                </a>
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
