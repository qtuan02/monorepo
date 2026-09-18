import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import * as z from "zod";

import { MonthField } from "~/components/form/month-field";

const schema = z.object({
  period: z.string().min(1, { error: "Vui lòng chọn kỳ." }),
});
type FormValues = z.infer<typeof schema>;

function MonthFieldHarness({
  onSubmit,
}: {
  onSubmit: (values: FormValues) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { period: "" },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <MonthField control={form.control} name="period" label="Kỳ" required />
      <button type="submit">Lưu</button>
    </form>
  );
}

describe("MonthField", () => {
  it("picking a month sets a YYYY-MM value and displays MM/YYYY", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MonthFieldHarness onSubmit={onSubmit} />);

    const trigger = screen.getByRole("button", { name: "Kỳ" });
    await user.click(trigger);
    await user.click(await screen.findByRole("button", { name: "Th 3" }));

    expect(trigger).toHaveTextContent(/^03\/\d{4}$/);

    await user.click(screen.getByRole("button", { name: "Lưu" }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ period: expect.stringMatching(/^\d{4}-03$/) }),
      expect.anything(),
    );
  });

  it("navigates the year without losing the selected month", async () => {
    const user = userEvent.setup();
    render(<MonthFieldHarness onSubmit={vi.fn()} />);

    const trigger = screen.getByRole("button", { name: "Kỳ" });
    await user.click(trigger);
    const currentYear = new Date().getFullYear();
    await user.click(screen.getByRole("button", { name: "Năm sau" }));
    expect(screen.getByText(String(currentYear + 1))).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Th 6" }));
    expect(trigger).toHaveTextContent(`06/${currentYear + 1}`);
  });
});
