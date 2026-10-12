'use client';

import { useState } from 'react';
import type { MonthlyImpactSummary } from '@/lib/dto/impactReport.dto';
import { formatWeight } from '@/lib/format';

/* impact over time components */

function formatKg(kg: number) {
  const weight = formatWeight(kg);
  return `${weight.value} ${weight.unit}`;
}

const METRICS = [
  {
    key: 'co2e',
    label: 'CO₂e avoided',
    getValue: (m: MonthlyImpactSummary) => m.totalCO2eAvoidedKg,
    format: formatKg,
  },
  {
    key: 'weight',
    label: 'Weight diverted',
    getValue: (m: MonthlyImpactSummary) => m.totalWeightDivertedKg,
    format: formatKg,
  },
  {
    key: 'donations',
    label: 'Donations',
    getValue: (m: MonthlyImpactSummary) => m.totalDonations,
    format: (v: number) => Math.round(v).toLocaleString('en-AU'),
  },
] as const;

const MONTHS_SHOWN = 12;

// fixed month names, toLocaleString gives different results on the server and
// in the browser (e.g. 'June' vs 'Jun') which breaks hydration
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/* the 12 months up to the latest month with data, filling months with no donations as 0 */
function lastTwelveMonths(months: MonthlyImpactSummary[]) {
  if (months.length === 0) return [];

  const byKey = new Map(months.map((m) => [m.month, m]));
  const latest = months.map((m) => m.month).sort().at(-1)!;
  const [year, month] = latest.split('-').map(Number);

  return Array.from({ length: MONTHS_SHOWN }, (_, i) => {
    const date = new Date(year, month - MONTHS_SHOWN + i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return { key, date, data: byKey.get(key) ?? null };
  });
}

/* rounds the axis max up to a clean number, e.g. 1,340 -> 2,000, 37 -> 40 */
function niceMax(max: number) {
  if (max <= 0) return 2;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 4, 6, 8, 10].find((s) => s * pow >= max)!;
  return Math.max(step * pow, 2);
}

export function ImpactOverTimeChart({ months }: { months: MonthlyImpactSummary[] }) {
  const [metricKey, setMetricKey] = useState<(typeof METRICS)[number]['key']>('co2e');
  const metric = METRICS.find((m) => m.key === metricKey)!;

  const columns = lastTwelveMonths(months).map((c) => ({
    ...c,
    value: c.data ? metric.getValue(c.data) : 0,
    label: MONTH_NAMES[c.date.getMonth()].slice(0, 3),
    fullLabel: `${MONTH_NAMES[c.date.getMonth()]} ${c.date.getFullYear()}`,
  }));

  if (columns.length === 0) return null;

  const total = columns.reduce((sum, c) => sum + c.value, 0);
  const axisMax = niceMax(Math.max(...columns.map((c) => c.value)));
  const ticks = [axisMax, axisMax / 2, 0];

  return (
    <div className="impact-over-time__chart-wrapper">
      {/* metric switch */}
      <div className="impact-over-time__controls" role="group" aria-label="Choose what to show">
        {METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            className="impact-over-time__control"
            aria-pressed={m.key === metricKey}
            onClick={() => setMetricKey(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <p className="impact-over-time__total">
        <span className="impact-over-time__total-value">{metric.format(total)}</span>{' '}
        {metric.label.toLowerCase()} from {columns[0].fullLabel} to {columns.at(-1)!.fullLabel}
      </p>

      <div className="impact-over-time__chart">
        {/* y axis */}
        <div className="impact-over-time__y-axis" aria-hidden="true">
          {ticks.map((t) => (
            <span
              key={t}
              className="impact-over-time__tick"
              style={{ bottom: `${(t / axisMax) * 100}%` }}
            >
              {metric.format(t)}
            </span>
          ))}
        </div>

        <div>
          <div className="impact-over-time__plot">
            {ticks.map((t) => (
              <div
                key={t}
                className="impact-over-time__gridline"
                style={{ bottom: `${(t / axisMax) * 100}%` }}
                aria-hidden="true"
              />
            ))}

            {columns.map((c, i) => {
              const isLatest = i === columns.length - 1;
              // keep the tooltip on screen at the edges of the chart
              const tooltipPosition = i < 2 ? 'start' : i > columns.length - 3 ? 'end' : 'center';

              return (
                <div
                  key={c.key}
                  className="impact-over-time__column"
                  tabIndex={0}
                  aria-label={`${c.fullLabel}: ${metric.format(c.value)} ${metric.label.toLowerCase()}`}
                >
                  <span
                    className={`impact-over-time__tooltip impact-over-time__tooltip--${tooltipPosition}`}
                    style={{ bottom: `calc(${(c.value / axisMax) * 100}% + 8px)` }}
                    aria-hidden="true"
                  >
                    <strong>{metric.format(c.value)}</strong>
                    <span>{c.fullLabel}</span>
                  </span>

                  {/* only the latest month is labelled directly, the rest are in the tooltip */}
                  {isLatest && c.value > 0 ? (
                    <span className="impact-over-time__bar-label" aria-hidden="true">
                      {metric.format(c.value)}
                    </span>
                  ) : null}

                  <div
                    className="impact-over-time__bar"
                    style={{ height: `${(c.value / axisMax) * 100}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* x axis */}
          <div className="impact-over-time__x-axis" aria-hidden="true">
            {columns.map((c, i) => (
              <span key={c.key} className="impact-over-time__month">
                {c.label}
                {i === 0 || c.date.getMonth() === 0 ? (
                  <span className="impact-over-time__year">{c.date.getFullYear()}</span>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* the same numbers as a table, for screen readers and anyone who prefers it */}
      <details className="impact-over-time__table-toggle">
        <summary>View as table</summary>
        {/* months run across, lining up with the chart, rather than down the page */}
        <div className="impact-over-time__table-scroll">
          <table className="impact-over-time__table">
            <thead>
              <tr>
                <th scope="col">Month</th>
                {columns.map((c) => (
                  <th key={c.key} scope="col">
                    {c.label}
                    <span className="impact-over-time__table-year">{c.date.getFullYear()}</span>
                  </th>
                ))}
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{metric.label}</th>
                {columns.map((c) => (
                  <td key={c.key}>{metric.format(c.value)}</td>
                ))}
                <td>{metric.format(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
