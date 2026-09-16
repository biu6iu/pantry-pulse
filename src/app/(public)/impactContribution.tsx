// our impact/contribution

import Image from 'next/image';
import { ImpactContributionStatCard } from '@/components/ui/ui';

const impactStats = [
  {
    value: '1028',
    label: 'locations have received your donations',
  },
  {
    value: '1028',
    label: 'organisations who donate',
  },
  {
    value: '1028',
    label: 'items saved from landfil',
  },
  {
    value: '1028',
    label: 'locations have received your donations',
  },
];

export default function ImpactContribution() {
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
            Thank you to the sponsors and the amazing volunteers
            which make programs like ours possible.
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
    </section>
  );
}
