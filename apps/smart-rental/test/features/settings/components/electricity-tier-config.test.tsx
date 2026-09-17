import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { mockElectricityTierConfig } from "~/constants/mock/settings";
import ElectricityTierConfig from "~/features/settings/components/electricity-tier-config";

const initialConfig = structuredClone(mockElectricityTierConfig);

function renderForm() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ElectricityTierConfig config={structuredClone(initialConfig)} />
    </QueryClientProvider>,
  );
}

describe("ElectricityTierConfig", () => {
  afterEach(() => {
    Object.assign(mockElectricityTierConfig, structuredClone(initialConfig));
  });

  it("saves an edited step into the Mock", async () => {
    const user = userEvent.setup();
    renderForm();

    const price = screen.getByLabelText("Bậc 1 đơn giá (đ)");
    await user.clear(price);
    await user.type(price, "1800");
    await user.click(screen.getByRole("button", { name: "Lưu cấu hình" }));

    await vi.waitFor(() =>
      expect(mockElectricityTierConfig.tiers[0]?.price).toBe(1800),
    );
  });

  it("adds a step starting after the last «Đến», and keeps an invalid row out of the Mock", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "Thêm bậc thang" }));
    expect(screen.getByLabelText("Bậc 5 từ (kWh)")).toHaveValue(301);

    await user.type(screen.getByLabelText("Bậc 5 đến (kWh)"), "200");
    await user.click(screen.getByRole("button", { name: "Lưu cấu hình" }));

    expect(
      await screen.findByText("Đến (kWh) phải lớn hơn hoặc bằng Từ (kWh)"),
    ).toBeInTheDocument();
    expect(mockElectricityTierConfig.tiers).toHaveLength(4);
  });
});
