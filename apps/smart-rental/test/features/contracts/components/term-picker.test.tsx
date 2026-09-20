import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import TermPicker from "~/features/contracts/components/term-picker";
import {
  computeContractEndDate,
  computeRenewedEndDate,
} from "~/features/contracts/utils/contract-term";

interface FormValues {
  endDate: string;
}

function TermPickerHarness({
  mode,
  anchorDate,
  defaultMonths,
  onSubmit,
}: {
  mode: "fresh" | "extend";
  anchorDate: string;
  defaultMonths: 6 | 12;
  onSubmit: (values: FormValues) => void;
}) {
  const form = useForm<FormValues>({ defaultValues: { endDate: "" } });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <TermPicker
        control={form.control}
        name="endDate"
        anchorDate={anchorDate}
        mode={mode}
        defaultMonths={defaultMonths}
        label="Thời hạn"
        dateFieldLabel="Ngày kết thúc"
      />
      <button type="submit">Lưu</button>
    </form>
  );
}

describe("TermPicker", () => {
  it("fresh + 12: ghi endDate bằng computeContractEndDate (anchor + 12 tháng − 1 ngày)", async () => {
    const anchorDate = "2026-01-15";
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TermPickerHarness
        mode="fresh"
        anchorDate={anchorDate}
        defaultMonths={6}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "12 tháng" }));
    await user.click(screen.getByRole("button", { name: "Lưu" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        endDate: computeContractEndDate(anchorDate, 12),
      }),
      expect.anything(),
    );
  });

  it("extend + 6: ghi endDate bằng computeRenewedEndDate (anchor + 6 tháng)", async () => {
    const anchorDate = "15/01/2026";
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TermPickerHarness
        mode="extend"
        anchorDate={anchorDate}
        defaultMonths={12}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "6 tháng" }));
    await user.click(screen.getByRole("button", { name: "Lưu" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        endDate: computeRenewedEndDate(anchorDate, 6),
      }),
      expect.anything(),
    );
  });

  it("Khác giữ nguyên ngày tự chọn; đổi preset sau đó tính đè lên", async () => {
    const anchorDate = "2026-01-15";
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TermPickerHarness
        mode="fresh"
        anchorDate={anchorDate}
        defaultMonths={12}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Khác" }));
    const trigger = screen.getByRole("button", { name: "Ngày kết thúc" });
    await user.click(trigger);
    await user.click(await screen.findByText("20"));

    // The hand-picked date survives — nothing recomputes it while still "Khác".
    expect(trigger).toHaveTextContent(/20\/\d{2}\/\d{4}/);

    // Switching back to a preset overwrites it.
    await user.click(screen.getByRole("button", { name: "12 tháng" }));
    await user.click(screen.getByRole("button", { name: "Lưu" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        endDate: computeContractEndDate(anchorDate, 12),
      }),
      expect.anything(),
    );
  });
});
