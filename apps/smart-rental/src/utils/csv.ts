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

/** The one CSV-file download — a Blob download, no library, a leading BOM so Excel reads Vietnamese diacritics as UTF-8. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`﻿${csv}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
