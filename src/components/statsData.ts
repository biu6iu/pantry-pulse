
// dollars of medical supplies put back into use for every $1 donated, shown in the closing donate section
export const SUPPLIES_PER_DOLLAR = 350;

// where the health impact tiers come from, cited in the impact section and the tracker's calculation panel
export const HEALTH_TIER_SOURCE = {
  title: 'Medical devices overview',
  publisher: 'Therapeutic Goods Administration (TGA)',
  url: 'https://www.tga.gov.au/products/medical-devices/overview/medical-devices-overview',
} as const;

// where the CO₂e emission factors come from, cited in the how we measure section
export const CO2E_FACTOR_SOURCE = {
  title: 'Greenhouse gas reporting: conversion factors 2022',
  publisher: 'UK Government (BEIS), via Climatiq',
  url: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2022',
} as const;

export const IMAGES = {
  heroPrimary: '/images/image1.jpg',
  heroSecondary: '/images/image2.jpg',
  mocBanner: '/images/mocBanner.jpg',
  logo: '/images/logo-transparent.png'
} as const;