import type { ReactNode } from "react";
import type { OverallImpactSummary } from "@/lib/dto/impactReport.dto";
import { formatCount, formatWeight } from "@/lib/format";

function SummaryTile({ label, value, unit }: { label: ReactNode; value: string; unit?: string }) {
  return (
    <div className="flex flex-col-reverse rounded-xl bg-[#d7e3ec] px-4 py-4">
      <dt className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-700">{label}</dt>
      <dd className="text-3xl font-extrabold leading-none text-[#141a43]">
        {value}
        {unit ? <span className="ml-1 text-base font-semibold">{unit}</span> : null}
      </dd>
    </div>
  );
}

/* the headline impact figures for a set of orders; the caller fetches the summary for its filters */
export function ImpactSummaryStrip({ summary }: { summary: OverallImpactSummary }) {
  const co2e = formatWeight(summary.totalCO2eAvoidedKg);

  return (
    <section aria-labelledby="impact-summary-heading">
      <h4 id="impact-summary-heading" className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#141a43]">
        Impact of completed orders in this selection
      </h4>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile label="Deliveries" value={formatCount(summary.totalDonations)} />
        <SummaryTile label="Items donated" value={formatCount(summary.totalItems)} />
        <SummaryTile
          label={
            <>
              CO<sub>2</sub>e avoided
            </>
          }
          value={co2e.value}
          unit={co2e.unit}
        />
        <SummaryTile label="Locations reached" value={formatCount(summary.locationsReached)} />
      </dl>
    </section>
  );
}
