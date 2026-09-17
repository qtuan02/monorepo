import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { LifecycleStep } from "~/components/stepper/lifecycle-stepper";
import { LifecycleStepper } from "~/components/stepper/lifecycle-stepper";

const steps: LifecycleStep[] = [
  { id: "room", title: "Phòng", isCompleted: true, isActive: false },
  { id: "tenant", title: "Người thuê", isCompleted: false, isActive: true },
  { id: "terms", title: "Điều khoản", isCompleted: false, isActive: false },
  { id: "confirm", title: "Xác nhận", isCompleted: false, isActive: false },
];

describe("LifecycleStepper — horizontal (wizard)", () => {
  it("collapses to 'Bước n/m · tên' for the mobile paragraph", () => {
    render(<LifecycleStepper steps={steps} orientation="horizontal" />);

    expect(screen.getByText("Bước 2/4 · Người thuê")).toBeInTheDocument();
  });

  it("still lists every step for the desktop row", () => {
    render(<LifecycleStepper steps={steps} orientation="horizontal" />);

    expect(screen.getByText("Điều khoản")).toBeInTheDocument();
    expect(screen.getByText("Xác nhận")).toBeInTheDocument();
    const active = screen.getByText("Người thuê").closest("li");
    expect(active?.querySelector('[aria-current="step"]')).toBeInTheDocument();
  });
});
