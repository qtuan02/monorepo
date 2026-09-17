import { describe, expect, it } from "vitest";

import type { Contract } from "~/types/contract";
import type { Utility } from "~/types/utility";
import {
  buildBatchInvoiceDueDate,
  buildBatchInvoiceLineItems,
  buildBatchInvoiceRows,
} from "~/utils/invoice-batch";

const today = new Date("2026-10-17T00:00:00.000Z");

function contract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "C001",
    buildingId: "b1",
    roomId: "R-B1-101",
    tenantId: "T001",
    contractNumber: "HĐ-001",
    tenant: "Nguyễn Văn A",
    room: "Phòng 101",
    floor: 1,
    rentAmount: 2_700_000,
    depositAmount: 2_700_000,
    depositStatus: "HELD",
    depositReturnedAmount: 0,
    paymentDueDay: 5,
    noticeDays: 30,
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    status: "ACTIVE",
    renewalHistory: [],
    lastUpdated: "01/09/2026",
    ...overrides,
  };
}

function utility(overrides: Partial<Utility> = {}): Utility {
  return {
    id: "u-1",
    buildingId: "b1",
    roomId: "R-B1-101",
    roomName: "Phòng 101",
    month: "2026-10",
    type: "electricity",
    oldIndex: 1000,
    newIndex: 1120,
    consumption: 120,
    status: "VERIFIED",
    updatedAt: "2026-10-01T00:00:00.000Z",
    proofImages: [],
    ...overrides,
  };
}

describe("buildBatchInvoiceRows", () => {
  it("is eligible once both điện and nước of the kỳ are VERIFIED", () => {
    const rows = buildBatchInvoiceRows(
      "b1",
      "2026-10",
      [contract()],
      [
        utility({ id: "u-d", type: "electricity", consumption: 120 }),
        utility({ id: "u-n", type: "water", consumption: 8 }),
      ],
      [],
      today,
    );

    expect(rows).toEqual([
      expect.objectContaining({
        contractId: "C001",
        electricityConsumption: 120,
        waterConsumption: 8,
        alreadyInvoiced: false,
        eligible: true,
      }),
    ]);
  });

  it("is not eligible — 'chưa đủ điều kiện' — when a Chỉ số of the kỳ is missing or still DRAFT", () => {
    const missingBoth = buildBatchInvoiceRows(
      "b1",
      "2026-10",
      [contract()],
      [],
      [],
      today,
    );
    expect(missingBoth[0]?.eligible).toBe(false);

    const draftWater = buildBatchInvoiceRows(
      "b1",
      "2026-10",
      [contract()],
      [
        utility({ id: "u-d", type: "electricity" }),
        utility({ id: "u-n", type: "water", status: "DRAFT" }),
      ],
      [],
      today,
    );
    expect(draftWater[0]?.eligible).toBe(false);
  });

  it("kỳ đã lập không lập lại — alreadyInvoiced turns an otherwise-ready row ineligible", () => {
    const existingInvoice = {
      contractId: "C001",
      billingMonth: "2026-10",
    };

    const rows = buildBatchInvoiceRows(
      "b1",
      "2026-10",
      [contract()],
      [
        utility({ id: "u-d", type: "electricity" }),
        utility({ id: "u-n", type: "water" }),
      ],
      [existingInvoice],
      today,
    );

    expect(rows[0]?.alreadyInvoiced).toBe(true);
    expect(rows[0]?.eligible).toBe(false);
  });

  it("drops a Hợp đồng that is not currently hiệu lực", () => {
    const rows = buildBatchInvoiceRows(
      "b1",
      "2026-10",
      [contract({ status: "TERMINATED" })],
      [],
      [],
      today,
    );
    expect(rows).toHaveLength(0);
  });
});

describe("buildBatchInvoiceLineItems", () => {
  it("bills đủ dòng: tiền phòng + điện/nước theo tiêu thụ × Bảng giá + dịch vụ cố định", () => {
    const lineItems = buildBatchInvoiceLineItems(
      { rentAmount: 2_700_000 },
      {
        priceList: {
          electricityPricePerKwh: 3_500,
          waterPricePerM3: 15_000,
          serviceFee: 100_000,
        },
      },
      120,
      8,
    );

    expect(lineItems).toEqual([
      {
        type: "RENT",
        description: "Tiền phòng",
        quantity: 1,
        unitPrice: 2_700_000,
        amount: 2_700_000,
      },
      {
        type: "ELECTRIC",
        description: "Tiền điện",
        quantity: 120,
        unitPrice: 3_500,
        amount: 420_000,
      },
      {
        type: "WATER",
        description: "Tiền nước",
        quantity: 8,
        unitPrice: 15_000,
        amount: 120_000,
      },
      {
        type: "SERVICE",
        description: "Phí dịch vụ",
        quantity: 1,
        unitPrice: 100_000,
        amount: 100_000,
      },
    ]);
  });
});

describe("buildBatchInvoiceDueDate", () => {
  it("hạn đúng ngày thu của Toà nhà, trong đúng kỳ", () => {
    expect(buildBatchInvoiceDueDate({ collectionDay: 5 }, "2026-10")).toBe(
      "05/10/2026",
    );
  });
});
