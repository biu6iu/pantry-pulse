import type { ReactNode } from "react";
import type { OverallImpactSummary } from "@/lib/dto/impactReport.dto";
import { formatCount, formatWeight } from "@/lib/format";

function Stat({ label, value, unit }: { label: ReactNode; value: string; unit?: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="mt-0.5 text-xs text-slate-500">{label}</dt>
      <dd className="text-base font-semibold text-[#141a43]">
        {value}
        {unit ? <span className="ml-1 text-xs font-medium">{unit}</span> : null}
      </dd>
    </div>
  );
}

interface ImpactSummaryProps {
  totalOrders: number; // every order matching the filters, whatever its status
  summary: OverallImpactSummary | null; // null when there are no impact figures to show for the selection
}

/*
 * the totals for a set of orders, as a quiet row of figures above the list.
 * Impact only counts completed orders to external recipients, so "delivered" can be lower than the order count
 */
export function ImpactSummary({ totalOrders, summary }: ImpactSummaryProps) {
  const co2e = summary ? formatWeight(summary.totalCO2eAvoidedKg) : null;
  const ordersLabel = totalOrders === 1 ? "Order" : "Orders";

  // with no impact figures there is only the order count, which looks stranded in a five-column row
  if (!summary || !co2e) {
    return (
      <dl
        className="flex justify-center rounded-xl bg-slate-50 px-4 py-3 text-center"
        aria-label="Totals for the selected orders"
      >
        <Stat label={ordersLabel} value={formatCount(totalOrders)} />
      </dl>
    );
  }

  return (
    <dl
      className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-slate-50 px-4 py-3 sm:grid-cols-3 lg:grid-cols-5"
      aria-label="Totals for the selected orders"
    >
      <Stat label={ordersLabel} value={formatCount(totalOrders)} />
      <Stat label="Delivered" value={formatCount(summary.totalDonations)} />
      <Stat label="Items donated" value={formatCount(summary.totalItems)} />
      <Stat
        label={
          <>
            CO<sub>2</sub>e avoided
          </>
        }
        value={co2e.value}
        unit={co2e.unit}
      />
      <Stat label="Locations reached" value={formatCount(summary.locationsReached)} />
    </dl>
  );
}
