import Image from 'next/image';
import {StatsBanner} from '../../components/ui/ui';
import { DonateButton } from '@/components/ui/donate';
import {IMAGES, STATS} from '../../components/statsData';
import { getImpactReport } from '@/lib/api/server';
import { formatWeight } from '@/lib/format';

export default async function Header() {
  const report = await getImpactReport();
  const overall = report?.overall;

  const co2e = overall ? formatWeight(overall.totalCO2eAvoidedKg) : null;
  const waste = overall ? formatWeight(overall.totalWeightDivertedKg) : null;

  // real figures first, then the static stats
  const stats = [
    ...(waste ? [`PREVENTED ${waste.value} ${waste.unit.toUpperCase()} OF WASTE`] : []),
    ...(co2e ? [`AVOIDED ${co2e.value} ${co2e.unit.toUpperCase()} OF CO2e EMISSIONS`] : []),
    ...STATS,
  ];

  return (
    <>

      <header data-hide-sticky-donate className="flex items-center justify-between px-6 py-4 bg-brand-blue">

        {/** the left section of the banner */}
        <div className="flex items-center gap-3">
          <div className="logo-container">
            {/* Render the image using the imported variable */}
            <img
              src={IMAGES.logo} alt="Company Logo" className="header-logo"
              style = {{height: '40px'}}
            />
          </div>
        
          <span className="text-xl font-bold text-white">Medical Pantry - Pantry Pulse</span>
        </div>

        {/** page navigation section */}
        <nav className="flex items-center gap-8 text-white">
          <a href="https://medicalpantry.org/" className="font-medium hover:underline">
            Main Site
          </a>
          <DonateButton placement="header" />
        </nav>
      </header>


      <StatsBanner stats={stats} />

      {/* the hero leads with the problem and the ask; the live figures back it up rather than lead */}
      <section data-hide-sticky-donate className="relative flex min-h-[460px] items-center overflow-hidden">
        <Image src={IMAGES.mocBanner} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/90 via-brand-blue/70 to-brand-blue/20" />

        <div className="relative max-w-3xl px-6 py-14 text-white md:px-12">
          <h1 className="text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.03em]">
            Usable medical supplies get thrown out every day. Clinics and rescues go without.
          </h1>

          <p className="mt-5 max-w-2xl text-[clamp(1.05rem,1.6vw,1.35rem)] leading-relaxed text-white/90">
            Medical Pantry&apos;s volunteers rescue surplus medical supplies and deliver them to the clinics,
            rescues and communities that need them.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <DonateButton placement="hero" size="lg">
              Donate now
            </DonateButton>
            <a href="#impact" className="font-semibold underline-offset-4 hover:underline">
              See where it goes ↓
            </a>
          </div>
        </div>
      </section>

    </>
  );
}

export function imageStats(){

}