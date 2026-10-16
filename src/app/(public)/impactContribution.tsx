// our impact/contribution

import Image from 'next/image';
import { ImpactContributionStatCard, ImpactCategoryRow } from '@/components/ui/ui';
import { ImpactOverTimeChart } from '@/components/charts/charts';
import { getImpactReport } from '@/lib/api/server';
import { formatCategory, formatWeight } from '@/lib/format';

const HEALTH_SCORE_LABELS: Record<number, string> = {
  4: 'Critical and high impact',
  3: 'High to moderate impact',
  2: 'Moderate impact',
  1: 'Low-risk, high utility impact',
};

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

      {healthRows.length > 0 ? (
        <div className="impact-breakdown">
          <div className="impact-contribution__grid impact-contribution__grid--visual-right">
            <div>
              <h2 className="impact-contribution__summary-title">How much these deliveries matter to care</h2>

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
          <h2 className="impact-contribution__summary-title">
            Which supplies save the most emissions
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
        </div>
      ) : null}

      {report && report.byMonth.length > 0 ? (
        <div className="impact-over-time">
          <h2 className="impact-contribution__summary-title">Month by month</h2>

          <p className="impact-contribution__paragraph">
            How much difference delivered donations have made each month over the last 12 months.
          </p>

          <ImpactOverTimeChart months={report.byMonth} />
        </div>
      ) : null}
    </section>
  );
}
