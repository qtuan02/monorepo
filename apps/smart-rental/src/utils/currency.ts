// One formatter for the whole Portal: the prototype's `vi-VN` VND with no decimals.
const CURRENCY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
}

/** The dashboard's short form: VND in triệu, one decimal — `545.2tr`. */
export function formatMillions(value: number): string {
  return `${(value / 1_000_000).toFixed(1)}tr`;
}
