export function formatDecimal(value: number | string): string {
  return Number(value).toFixed(2);
}
