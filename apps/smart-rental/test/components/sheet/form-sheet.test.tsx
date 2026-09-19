import type { FieldErrors, FieldValues } from "react-hook-form";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FormSheet } from "~/components/sheet/form-sheet";

interface HarnessProps {
  isDirty: boolean;
  onOpenChange: (open: boolean) => void;
  errors?: FieldErrors<FieldValues>;
}

function FormSheetHarness({ isDirty, onOpenChange, errors }: HarnessProps) {
  const [open, setOpen] = useState(true);

  return (
    <FormSheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange(next);
      }}
      title="Thêm toà nhà mới"
      formId="test-form"
      onSubmit={(event) => event.preventDefault()}
      isDirty={isDirty}
      errors={errors}
    >
      <p>Nội dung form</p>
    </FormSheet>
  );
}

describe("FormSheet", () => {
  it("closes immediately when the form is not dirty", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<FormSheetHarness isDirty={false} onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole("button", { name: "Hủy" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByText("Nội dung form")).not.toBeInTheDocument();
  });

  it("asks for confirmation before closing a dirty form, and keeps it open on cancel", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<FormSheetHarness isDirty onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole("button", { name: "Hủy" }));
    expect(
      await screen.findByRole("alertdialog", { name: "Hủy thay đổi?" }),
    ).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Tiếp tục sửa" }));
    expect(
      screen.queryByRole("alertdialog", { name: "Hủy thay đổi?" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Nội dung form")).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("discards and closes once the confirmation is accepted", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<FormSheetHarness isDirty onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole("button", { name: "Hủy" }));
    await user.click(
      await screen.findByRole("button", { name: "Đóng biểu mẫu" }),
    );

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders a FormErrorSummary once `errors` carries ≥ 2 invalid fields", () => {
    render(
      <FormSheetHarness
        isDirty={false}
        onOpenChange={vi.fn()}
        errors={{
          name: { type: "required", message: "Bắt buộc" },
          email: { type: "required", message: "Email không hợp lệ" },
        }}
      />,
    );

    expect(
      screen.getByText(/^Vui lòng kiểm tra lại \d+ lỗi$/),
    ).toBeInTheDocument();
  });

  it("shows no FormErrorSummary when `errors` is empty or omitted", () => {
    render(<FormSheetHarness isDirty={false} onOpenChange={vi.fn()} />);

    expect(
      screen.queryByText(/^Vui lòng kiểm tra lại \d+ lỗi$/),
    ).not.toBeInTheDocument();
  });
});
