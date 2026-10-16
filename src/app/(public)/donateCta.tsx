// closing donate section, after the impact figures and before the order tracker

import { DonateButton } from '@/components/ui/donate';
import { SUPPLIES_PER_DOLLAR } from '@/components/statsData';

// example gifts, each shown with the value of supplies it puts back into use
const EXAMPLE_AMOUNTS = [10, 25, 50];

const formatDollars = (n: number) => `$${n.toLocaleString('en-AU')}`;

export default function DonateCta() {
  return (
    <section id="donate" data-hide-sticky-donate className="bg-brand-blue px-6 py-16 font-sans text-white">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-[clamp(1.9rem,3.4vw,3.4rem)] font-bold leading-[1.1] tracking-[-0.04em]">
          Help fund the next delivery
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-[clamp(1.05rem,1.6vw,1.35rem)] leading-relaxed text-white/90">
          Medical Pantry is run entirely by volunteers, so your money goes into getting supplies where they
          are needed. Every $1 donated puts more than {formatDollars(SUPPLIES_PER_DOLLAR)} of medical supplies
          back into use.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {EXAMPLE_AMOUNTS.map((amount) => (
            <li key={amount} className="rounded-2xl border border-white/20 bg-white/10 px-5 py-6">
              <p className="text-4xl font-bold tracking-[-0.04em]">{formatDollars(amount)}</p>
              <p className="mt-2 text-white/90">
                puts {formatDollars(amount * SUPPLIES_PER_DOLLAR)}+ of supplies back into use
              </p>
            </li>
          ))}
        </ul>

        <DonateButton placement="closing" size="lg" className="mt-10">
          Donate now
        </DonateButton>
      </div>
    </section>
  );
}
