// a fixed locale so the server and the browser format numbers the same way,
// otherwise a visitor with e.g. German settings gets '1.240' in the browser and a hydration error
const LOCALE = 'en-AU';

/* shows kg below 1000, tonnes above, e.g. 850 -> { value: '850', unit: 'kg' }, 15200 -> { value: '15.2', unit: 'tonnes' } */
export function formatWeight(kg: number) {
  if (kg >= 1000) {
    return { value: (kg / 1000).toLocaleString(LOCALE, { maximumFractionDigits: 1 }), unit: 'tonnes' };
  }
  return { value: Math.round(kg).toLocaleString(LOCALE), unit: 'kg' };
}

/* a short date such as '29 Aug 2026', read in UTC so every visitor sees the same day */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/* turns a category key into a readable name, e.g. 'medical_equipment' -> 'Medical equipment' */
export function formatCategory(category: string) {
  const words = category.replace(/_/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
