import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { CycleFormValues } from "~/features/cycles/types/cycle-form";
import type { CycleRow, CycleRowStatus } from "~/types/cycle";
import type { UtilityType } from "~/types/utility";
import { MeterCell, meterGates } from "~/features/cycles/components/meter-cell";
import { queryClient } from "~/libs/query-client";

function row(overrides: Partial<CycleRow> = {}): CycleRow {
  return {
    roomId: "R-001",
    roomName: "Phòng 101",
    contractId: "C001",
    tenant: "Nguyễn Văn A",
    rentAmount: 2_000_000,
    oldElectricity: 100,
    oldWater: 10,
    newElectricity: 150,
    newWater: 15,
    electricityConsumption: 50,
    waterConsumption: 5,
    electricAmount: 175_000,
    waterAmount: 75_000,
    totalAmount: 2_250_000,
    status: "READY",
    reason: "Sẵn sàng",
    electricityAnomalyReason: null,
    waterAnomalyReason: null,
    rentProrationNote: null,
    ...overrides,
  };
}

describe("meterGates", () => {
  it.each([
    ["EMPTY", false, false, false, false],
    ["EMPTY", true, false, false, false],
    ["INVOICED", false, false, false, false],
    ["INVOICED", true, false, false, false],
    ["READY", false, true, true, false],
    ["READY", true, false, false, false],
    ["ANOMALY", false, true, true, true],
    ["ANOMALY", true, false, false, false],
  ] as const)(
    "%s × readOnly=%s → editable=%s correctable=%s approvable=%s",
    (status, readOnly, editable, correctable, approvable) => {
      const testRow = row({
        status: status as CycleRowStatus,
        electricityAnomalyReason:
          status === "ANOMALY" ? "gấp 2 lần kỳ trước" : null,
      });

      expect(meterGates(testRow, "electricity", readOnly)).toEqual({
        editable,
        correctable,
        approvable,
      });
    },
  );

  it("is not approvable for the đồng hồ that has no anomaly of its own, even on an ANOMALY row — the table's rule, not the card's looser one", () => {
    const testRow = row({
      status: "ANOMALY",
      electricityAnomalyReason: "gấp 2 lần kỳ trước",
      waterAnomalyReason: null,
    });

    expect(meterGates(testRow, "water", false).approvable).toBe(false);
  });
});

interface HarnessProps {
  row: CycleRow;
  type: UtilityType;
  readOnly?: boolean;
}

function MeterCellHarness({
  row: cycleRow,
  type,
  readOnly = false,
}: HarnessProps): ReactNode {
  const form = useForm<CycleFormValues>({
    defaultValues: {
      rows: [
        {
          roomId: cycleRow.roomId,
          newElectricity:
            cycleRow.newElectricity != null
              ? String(cycleRow.newElectricity)
              : "",
          newWater:
            cycleRow.newWater != null ? String(cycleRow.newWater) : "",
        },
      ],
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MeterCell
        row={cycleRow}
        type={type}
        index={0}
        control={form.control}
        month="2026-09"
        readOnly={readOnly}
      />
    </QueryClientProvider>
  );
}

describe("MeterCell", () => {
  it("renders the chỉ số mới input when editable", () => {
    queryClient.clear();
    render(<MeterCellHarness row={row({ status: "READY" })} type="electricity" />);

    expect(
      screen.getByRole("spinbutton", {
        name: "Chỉ số điện mới phòng Phòng 101",
      }),
    ).toBeInTheDocument();
  });

  it("khoá ô nhập — Phòng trống", () => {
    render(<MeterCellHarness row={row({ status: "EMPTY" })} type="electricity" />);

    expect(
      screen.queryByRole("spinbutton", {
        name: "Chỉ số điện mới phòng Phòng 101",
      }),
    ).not.toBeInTheDocument();
  });

  it("khoá ô nhập — Kỳ đã lập Hoá đơn cho Phòng này", () => {
    render(
      <MeterCellHarness row={row({ status: "INVOICED" })} type="electricity" />,
    );

    expect(
      screen.queryByRole("spinbutton", {
        name: "Chỉ số điện mới phòng Phòng 101",
      }),
    ).not.toBeInTheDocument();
  });

  it("khoá ô nhập — Kỳ readOnly (đã lập hoặc tương lai)", () => {
    render(
      <MeterCellHarness
        row={row({ status: "READY" })}
        type="electricity"
        readOnly
      />,
    );

    expect(
      screen.queryByRole("spinbutton", {
        name: "Chỉ số điện mới phòng Phòng 101",
      }),
    ).not.toBeInTheDocument();
  });

  it("shows Duyệt only when the row is ANOMALY and this đồng hồ has its own reason", () => {
    render(
      <MeterCellHarness
        row={row({
          status: "ANOMALY",
          electricityAnomalyReason: "gấp 2 lần kỳ trước",
        })}
        type="electricity"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Duyệt điện" }),
    ).toBeInTheDocument();
  });

  it("hides Duyệt for the đồng hồ with no anomaly of its own, even though the row is ANOMALY", () => {
    render(
      <MeterCellHarness
        row={row({
          status: "ANOMALY",
          electricityAnomalyReason: "gấp 2 lần kỳ trước",
          waterAnomalyReason: null,
        })}
        type="water"
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Duyệt nước" }),
    ).not.toBeInTheDocument();
  });

  it("hides Duyệt when readOnly, even for an anomalous đồng hồ — the card no longer loosens the table's rule", () => {
    render(
      <MeterCellHarness
        row={row({
          status: "ANOMALY",
          electricityAnomalyReason: "gấp 2 lần kỳ trước",
        })}
        type="electricity"
        readOnly
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Duyệt điện" }),
    ).not.toBeInTheDocument();
  });

  it("shows the Sửa chỉ số cũ trigger only when correctable", () => {
    render(<MeterCellHarness row={row({ status: "READY" })} type="electricity" />);

    expect(
      screen.getByRole("button", {
        name: "Sửa chỉ số điện cũ phòng Phòng 101",
      }),
    ).toBeInTheDocument();
  });

  it("hides the Sửa chỉ số cũ trigger for a Phòng trống", () => {
    render(<MeterCellHarness row={row({ status: "EMPTY" })} type="electricity" />);

    expect(
      screen.queryByRole("button", {
        name: "Sửa chỉ số điện cũ phòng Phòng 101",
      }),
    ).not.toBeInTheDocument();
  });

  it("opens Sửa chỉ số cũ on click", async () => {
    const user = userEvent.setup();
    render(<MeterCellHarness row={row({ status: "READY" })} type="electricity" />);

    await user.click(
      screen.getByRole("button", {
        name: "Sửa chỉ số điện cũ phòng Phòng 101",
      }),
    );

    expect(
      await screen.findByLabelText("Chỉ số điện cũ mới"),
    ).toBeInTheDocument();
  });
});
