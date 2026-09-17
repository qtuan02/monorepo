export interface CsvColumn<T> {
  key: keyof T;
  header: string;
}

function escapeCsvValue(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** "CSV từ một mảng hàng + cột" (spec #153 §10 row 13) — RFC 4180 escaping. */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const lines = [
    columns.map((column) => escapeCsvValue(column.header)).join(","),
  ];
  for (const row of rows) {
    lines.push(
      columns.map((column) => escapeCsvValue(row[column.key])).join(","),
    );
  }
  return lines.join("\n");
}
