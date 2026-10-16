export const DONATE_URL = 'https://www.givenow.com.au/medicalpantry';

// where on the page a donate link sits, sent to GiveNow as utm_content so clicks can be compared by placement
export type DonatePlacement = 'header' | 'hero' | 'closing' | 'sticky' | 'tracker';

export function donateHref(placement: DonatePlacement): string {
  const url = new URL(DONATE_URL);
  url.searchParams.set('utm_source', 'pantrypulse');
  url.searchParams.set('utm_medium', 'website');
  url.searchParams.set('utm_content', placement);
  return url.toString();
}

const SIZE_CLASSES = {
  sm: 'px-5 py-1.5',
  lg: 'px-8 py-3 text-lg',
} as const;

// red pill with a lighter rim and lip underneath, like the button on medicalpantry.org
export function DonateButton({
  placement,
  size = 'sm',
  children = 'Donate',
  className = '',
}: {
  placement: DonatePlacement;
  size?: keyof typeof SIZE_CLASSES;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={donateHref(placement)}
      className={`inline-block rounded-full border border-[#f08a8d] bg-brand-red font-bold text-white shadow-[0_4px_0_#e8676b] hover:brightness-110 ${SIZE_CLASSES[size]} ${className}`}
    >
      {children}
    </a>
  );
}
