
// dollars of medical supplies put back into use for every $1 donated; also used by the closing donate section
export const SUPPLIES_PER_DOLLAR = 350;

// static stats that don't come from the impact report;
// the waste and CO2 figures are calculated in header.tsx
export const STATS: string[] = [
  'RUN 100% BY VOLUNTEERS',
  `FOR EVERY $1 WE DONATE $${SUPPLIES_PER_DOLLAR}+ OF MEDICAL SUPPLIES`,
];

export const IMAGES = {
  heroPrimary: '/images/image1.jpg',
  heroSecondary: '/images/image2.jpg',
  mocBanner: '/images/mocBanner.jpg',
  logo: '/images/logo-transparent.png'
} as const;