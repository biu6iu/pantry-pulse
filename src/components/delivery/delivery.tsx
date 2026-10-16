// Pieces shared by the two places one delivery is shown: the featured delivery story and a tracked order.
// No hooks, so they render in both the server and the client component.

import type { ReactNode } from 'react';
import type { DonationDTO } from '@/lib/dto/donation.dto';
import { formatCount, formatWeight } from '@/lib/format';

/* what was delivered, largest quantity first, e.g. "4 × Syringe pump infuser" */
export function DeliveryItemList({ items }: { items: DonationDTO['items'] }) {
  return (
    <ul className="space-y-2 text-lg">
      {items.toSorted((a, b) => b.quantity - a.quantity).map((item) => (
        <li key={item.entryId} className="flex gap-3">
          <span className="shrink-0 font-bold">{formatCount(item.quantity)} ×</span>
          <span>{item.itemName}</span>
        </li>
      ))}
    </ul>
  );
}

function StatCard({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className="mt-1 text-2xl font-bold">{children}</dd>
    </div>
  );
}

function Weight({ kg, emptyLabel }: { kg: number | null; emptyLabel: string }) {
  if (kg == null) return <span className="text-lg text-slate-500">{emptyLabel}</span>;
  const weight = formatWeight(kg);
  return (
    <>
      {weight.value} <span className="text-lg">{weight.unit}</span>
    </>
  );
}

/* the three impact figures for one delivery, as cards */
export function DeliveryImpactStats({
  health,
  healthDetail,
  weightKg,
  co2eKg,
  emptyLabel = 'Not recorded',
}: {
  health: string; // e.g. 'High', or 'Pending' for an order that is not completed
  healthDetail?: string; // a line under the rating, e.g. '3.8 out of 4'
  weightKg: number | null;
  co2eKg: number | null;
  emptyLabel?: string; // shown in place of a missing weight, e.g. 'Pending' before an order is delivered
}) {
  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Health impact">
        {health}
        {healthDetail ? <span className="block text-sm font-medium text-slate-600">{healthDetail}</span> : null}
      </StatCard>
      <StatCard label="Kept out of landfill">
        <Weight kg={weightKg} emptyLabel={emptyLabel} />
      </StatCard>
      <StatCard label={<>CO<sub>2</sub>e avoided</>}>
        <Weight kg={co2eKg} emptyLabel={emptyLabel} />
      </StatCard>
    </dl>
  );
}
