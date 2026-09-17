import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import * as z from "zod";

import { DateField } from "~/components/form/date-field";

const schema = z.object({
  startDate: z.string().min(1, { error: "Vui lòng chọn ngày." }),
});
type FormValues = z.infer<typeof schema>;

function DateFieldHarness({
  onSubmit,
}: {
  onSubmit: (values: FormValues) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { startDate: "" },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <DateField
        control={form.control}
        name="startDate"
        label="Ngày bắt đầu"
        required
      />
      <button type="submit">Lưu</button>
    </form>
  );
}

describe("DateField", () => {
  it("shows the picked date as DD/MM/YYYY and submits an ISO value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<DateFieldHarness onSubmit={onSubmit} />);

    // The label ("Ngày bắt đầu") is the trigger's accessible name, per the
    // <label htmlFor> association — not its visible "Chọn ngày" content, so
    // the picked date is read from the trigger's own text instead.
    const trigger = screen.getByRole("button", { name: "Ngày bắt đầu" });
    await user.click(trigger);
    await user.click(await screen.findByText("15"));

    expect(trigger).toHaveTextContent(/15\/\d{2}\/\d{4}/);

    await user.click(screen.getByRole("button", { name: "Lưu" }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: expect.stringMatching(/^\d{4}-\d{2}-15$/),
      }),
      expect.anything(),
    );
  });

  it("marks the label required and wires aria-describedby to the error", async () => {
    const user = userEvent.setup();
    render(<DateFieldHarness onSubmit={vi.fn()} />);

    expect(screen.getByText("Ngày bắt đầu")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Lưu" }));

    const trigger = await screen.findByRole("button", { name: "Ngày bắt đầu" });
    const describedBy = trigger.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy ?? "")).toHaveTextContent(
      "Vui lòng chọn ngày.",
    );
  });
});
