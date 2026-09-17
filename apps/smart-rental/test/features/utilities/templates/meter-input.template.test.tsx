import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import dayjs from "@monorepo/dayjs";

import { mockRooms } from "~/constants/mock/rooms";
import { mockUtilities } from "~/constants/mock/utilities";
import MeterInputTemplate from "~/features/utilities/templates/meter-input.template";
import { useBuildingStore } from "~/stores/use-building-store";
import { buildMeterInputRooms } from "~/utils/meter-input-rooms";

const initialBuildingState = useBuildingStore.getState();
const currentMonth = dayjs().format("YYYY-MM");

function renderTemplate() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MeterInputTemplate />
    </QueryClientProvider>,
  );
}

describe("MeterInputTemplate", () => {
  beforeEach(() => {
    // Nhập chỉ số needs exactly one Toà nhà scoped (spec #153 §10 row 4).
    useBuildingStore.setState(
      { ...initialBuildingState, selectedBuildingId: "b1" },
      true,
    );
  });

  it("computes consumption as the reading is typed and derives the row's status", async () => {
    const user = userEvent.setup();
    renderTemplate();

    const row = await screen.findByRole("row", { name: /^Phòng 102\b/ });
    const rooms = buildMeterInputRooms(
      "b1",
      currentMonth,
      mockRooms,
      mockUtilities,
    );
    const phong102 = rooms.find((r) => r.name === "Phòng 102");
    expect(phong102).toBeDefined();

    expect(within(row).getByText("Chưa nhập")).toBeInTheDocument();

    await user.type(
      within(row).getByRole("spinbutton", {
        name: "Chỉ số điện mới phòng Phòng 102",
      }),
      String((phong102?.lastElectricity ?? 0) + 5),
    );
    expect(within(row).getByText("5")).toBeInTheDocument();
    expect(within(row).getByText("Nháp")).toBeInTheDocument();

    // Below last month's index — always an anomaly regardless of the ratio.
    await user.type(
      within(row).getByRole("spinbutton", {
        name: "Chỉ số nước mới phòng Phòng 102",
      }),
      "0",
    );
    expect(within(row).getByText("Bất thường")).toBeInTheDocument();
  });

  it("blocks the save button while an anomaly is unapproved, then unblocks it once duyệt", async () => {
    const user = userEvent.setup();
    renderTemplate();

    const row = await screen.findByRole("row", { name: /^Phòng 102\b/ });
    await user.type(
      within(row).getByRole("spinbutton", {
        name: "Chỉ số nước mới phòng Phòng 102",
      }),
      "0",
    );

    expect(within(row).getByText("Bất thường")).toBeInTheDocument();
    const saveButton = screen.getByRole("button", { name: /^Lưu \d+ chỉ số$/ });
    expect(saveButton).toBeDisabled();
    expect(
      screen.getByText(/Có chỉ số bất thường chưa được duyệt/),
    ).toBeInTheDocument();

    await user.click(
      within(row).getByRole("button", { name: "Duyệt bất thường" }),
    );

    expect(within(row).getByText("Đã duyệt")).toBeInTheDocument();
    expect(saveButton).toBeEnabled();
  });

  it("names n in the save button's own label as valid readings are typed", async () => {
    const user = userEvent.setup();
    renderTemplate();

    const row = await screen.findByRole("row", { name: /^Phòng 102\b/ });
    const rooms = buildMeterInputRooms(
      "b1",
      currentMonth,
      mockRooms,
      mockUtilities,
    );
    const phong102 = rooms.find((r) => r.name === "Phòng 102");
    expect(phong102).toBeDefined();

    expect(screen.getByRole("button", { name: "Lưu 0 chỉ số" })).toBeDisabled();

    // A small, in-range increment — well under 2× the previous period, so
    // this reading is a plain "draft" and does not gate the button.
    await user.type(
      within(row).getByRole("spinbutton", {
        name: "Chỉ số điện mới phòng Phòng 102",
      }),
      String((phong102?.lastElectricity ?? 0) + 5),
    );

    expect(screen.getByRole("button", { name: "Lưu 1 chỉ số" })).toBeEnabled();
  });

  it("names the field that is not a whole number on submit", async () => {
    const user = userEvent.setup();
    renderTemplate();

    const row = await screen.findByRole("row", { name: /^Phòng 102\b/ });
    const rooms = buildMeterInputRooms(
      "b1",
      currentMonth,
      mockRooms,
      mockUtilities,
    );
    const phong102 = rooms.find((r) => r.name === "Phòng 102");
    expect(phong102).toBeDefined();

    // A small, non-anomalous increment with a decimal — a plain "draft" that
    // still fails Zod's whole-number regex, so the save button stays enabled
    // and the submit itself is what has to catch the format.
    await user.type(
      within(row).getByRole("spinbutton", {
        name: "Chỉ số điện mới phòng Phòng 102",
      }),
      String((phong102?.lastElectricity ?? 0) + 5.5),
    );
    await user.click(screen.getByRole("button", { name: /^Lưu \d+ chỉ số$/ }));

    expect(
      await within(row).findByText("Chỉ số phải là số nguyên"),
    ).toBeInTheDocument();
  });
});
