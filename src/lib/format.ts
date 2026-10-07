/* shows kg below 1000, tonnes above, e.g. 850 -> { value: '850', unit: 'kg' }, 15200 -> { value: '15.2', unit: 'tonnes' } */
export function formatWeight(kg: number) {
  if (kg >= 1000) {
    return { value: (kg / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 }), unit: 'tonnes' };
  }
  return { value: Math.round(kg).toLocaleString(), unit: 'kg' };
}
