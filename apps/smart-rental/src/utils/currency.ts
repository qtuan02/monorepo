// One formatter for the whole Portal: the prototype's `vi-VN` VND with no decimals.
const CURRENCY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
}
