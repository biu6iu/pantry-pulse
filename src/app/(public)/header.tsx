import Image from 'next/image';
import { DonateButton } from '@/components/ui/donate';
import { IMAGES } from '../../components/statsData';

// in-page links to the sections further down; hidden on small screens, where they would crowd the bar
const SECTION_LINKS = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#impact', label: 'Our Impact' },
  { href: '#track', label: 'Track a Delivery' },
  { href: '#how-we-measure', label: 'How We Measure' },
];

export default function Header() {
  return (
    <>
      <header
        data-hide-sticky-donate
        className="flex items-center justify-between gap-6 bg-brand-blue px-6 py-3 text-white md:px-12"
      >
        <a href="#" className="flex items-center gap-3">
          <Image src={IMAGES.logo} alt="" width={44} height={44} priority />
          <span className="flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-[-0.02em]">Pantry Pulse</span>
            <span className="text-xs font-medium text-white/70">by Medical Pantry</span>
          </span>
        </a>

        <nav aria-label="Main" className="flex items-center gap-6">
          <ul className="hidden items-center gap-5 lg:flex">
            {SECTION_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="font-medium text-white/85 hover:text-white hover:underline underline-offset-4">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="https://medicalpantry.org/"
            className="hidden font-medium text-white/85 underline-offset-4 hover:text-white hover:underline sm:inline"
          >
            Main site
          </a>
          <DonateButton placement="header" />
        </nav>
      </header>

      {/* the hero leads with the problem and the ask */}
      <section data-hide-sticky-donate className="relative flex min-h-[460px] items-center overflow-hidden">
        <Image src={IMAGES.mocBanner} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/90 via-brand-blue/70 to-brand-blue/20" />

        {/* the same centred column as the sections below, so the text lines up with theirs */}
        <div className="relative mx-auto w-full max-w-6xl px-6 py-14 text-white">
          <div className="max-w-3xl">
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
        </div>
      </section>
    </>
  );
}
