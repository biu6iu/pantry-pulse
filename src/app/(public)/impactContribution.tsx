// our impact/contribution

import Image from 'next/image';
import { ImpactContributionStatCard, ImpactCategoryRow } from '@/components/ui/ui';
import { ImpactOverTimeChart } from '@/components/charts/charts';
import { getImpactReport } from '@/lib/api/server';
import { formatCategory, formatWeight } from '@/lib/format';

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
      label: 'locations have received your donations',
    },
    {
      value: itemsSavedCount,
      label: 'items saved from landfill',
    },
    {
      value: totalDonationsCount,
      label: 'donations made',
    },
    {
      value: donationsLastMonthCount,
      label: 'donations made last month',
    },
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

  return (
    <section className="impact-contribution">
      <div className="impact-contribution__header">
        <div className="impact-contribution__copy">
          <h2 className="impact-contribution__title">OUR IMPACT</h2>

          <p className="impact-contribution__paragraph">
            Every figure in this report traces back to individual items that have
            been donated.
          </p>

          <p className="impact-contribution__paragraph">
            Thank you to the sponsors and the volunteers
            who make programs like ours possible.
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
          YOUR CONTRIBUTION MEANS
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

      {categoryRows.length > 0 ? (
        <div className="impact-breakdown">
          <h2 className="impact-contribution__summary-title">
            WHERE YOUR DONATIONS MAKE THE MOST DIFFERENCE
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
          <h2 className="impact-contribution__summary-title">IMPACT OVER TIME</h2>

          <p className="impact-contribution__paragraph">
            How much difference delivered donations have made each month.
          </p>

          <ImpactOverTimeChart months={report.byMonth} />
        </div>
      ) : null}
    </section>
  );
}
