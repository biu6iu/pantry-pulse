// Rounds to ~1.1km precision so a recipient's exact street address can't be derived
// from any coordinates the API returns (the tracking map and impact locations)
const COORDINATE_PRECISION = 2;

export function roundCoordinate(value: number | null): number | null {
  if (value === null) return null;
  return Number(value.toFixed(COORDINATE_PRECISION));
}
