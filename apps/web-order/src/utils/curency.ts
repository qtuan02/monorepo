export function formatCurrency(rawNumber: number) {
  return rawNumber.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}
