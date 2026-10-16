// follow one delivery: a recent order told as a story, between how it works and the impact figures

import { getDonation, getTracking, listDonations } from '@/lib/api/server';
import { pickFeaturedDelivery, RECIPIENT_PHRASES } from '@/lib/featuredDelivery';
import { formatCount, formatDate, formatWeight } from '@/lib/format';
import { regionName } from '@/lib/regionNames';
import { TrackingMap } from '@/components/maps/maps';

// how many of the newest completed orders to choose from
const CANDIDATE_COUNT = 30;

export default async function FeaturedDelivery() {
  const list = await listDonations({ status: 'COMPLETED', limit: CANDIDATE_COUNT });
  const featured = pickFeaturedDelivery(list?.items ?? []);
  if (!featured) return null;

  const [donation, tracking] = await Promise.all([getDonation(featured.id), getTracking(featured.id)]);
  if (!donation || !tracking) return null;

  // the recipient's name is not published, so the story and the map pin both use the kind of recipient
  const recipient = RECIPIENT_PHRASES[featured.receiver.type!];
  const anonymousTracking = {
    ...tracking,
    receiver: {
      ...tracking.receiver,
      id: null,
      organisation: recipient.charAt(0).toUpperCase() + recipient.slice(1),
    },
  };

  const place = [featured.receiver.city, regionName(featured.receiver.state)].filter(Boolean).join(', ');
  const items = donation.items.toSorted((a, b) => b.quantity - a.quantity);
  const impact = donation.environmentalImpact;
  const weight = impact ? formatWeight(impact.weightDivertedKg) : null;
  const co2e = impact ? formatWeight(impact.co2eAvoidedKg) : null;

  return (
    <section className="bg-[#d7e3ec] px-6 py-16 font-sans text-brand-blue">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-red">One recent delivery</p>
          <h2 className="mt-2 text-[clamp(1.9rem,3.4vw,3.4rem)] font-bold leading-[1.1] tracking-[-0.04em]">
            From our shelves to {recipient} in {featured.receiver.city}
          </h2>

          <p className="mt-5 text-lg leading-relaxed">
            On {formatDate(featured.dateCompleted!)}, {recipient} in {place} received supplies that would
            otherwise have gone to waste:
          </p>

          <ul className="mt-4 space-y-2 text-lg">
            {items.map((item) => (
              <li key={item.entryId} className="flex gap-3">
                <span className="shrink-0 font-bold">{formatCount(item.quantity)} ×</span>
                <span>{item.itemName}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <dt className="text-sm text-slate-600">Health impact</dt>
              <dd className="mt-1 text-2xl font-bold">High</dd>
            </div>
            {weight ? (
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <dt className="text-sm text-slate-600">Kept out of landfill</dt>
                <dd className="mt-1 text-2xl font-bold">
                  {weight.value} {weight.unit}
                </dd>
              </div>
            ) : null}
            {co2e ? (
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <dt className="text-sm text-slate-600">
                  CO<sub>2</sub>e avoided
                </dt>
                <dd className="mt-1 text-2xl font-bold">
                  {co2e.value} {co2e.unit}
                </dd>
              </div>
            ) : null}
          </dl>

          <p className="mt-8 text-lg font-semibold">
            That&apos;s one delivery.{' '}
            <a href="#donate" className="text-brand-red underline underline-offset-4 hover:no-underline">
              Help fund the next one
            </a>
          </p>
        </div>

        <div className="min-w-0">
          <TrackingMap tracking={anonymousTracking} />
        </div>
      </div>
    </section>
  );
}
