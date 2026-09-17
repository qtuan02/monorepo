import { describe, expect, it } from "vitest";

import { toCsv } from "~/utils/csv";

describe("toCsv", () => {
  it("writes a header row from the column labels", () => {
    const csv = toCsv(
      [{ name: "A", amount: 100 }],
      [
        { key: "name", header: "Tên" },
        { key: "amount", header: "Số tiền" },
      ],
    );

    expect(csv).toBe("Tên,Số tiền\nA,100");
  });

  it("quotes a value containing a comma, a quote, or a newline", () => {
    const csv = toCsv(
      [{ note: 'Phòng 101, có "ban công"\nTầng 1' }],
      [{ key: "note", header: "Ghi chú" }],
    );

    expect(csv).toBe('Ghi chú\n"Phòng 101, có ""ban công""\nTầng 1"');
  });

  it("renders null/undefined as an empty cell", () => {
    const csv = toCsv([{ note: null }], [{ key: "note", header: "Ghi chú" }]);

    expect(csv).toBe("Ghi chú\n");
  });
});
