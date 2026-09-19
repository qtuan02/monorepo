import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HEADER_ACTION_SLOT_ID } from "~/components/page/header-action-slot";
import { ListPageHeader } from "~/components/page/list-page-header";

// Round 4 §10 Q2/Q12: the screen's own `<h1>` is the one heading a visitor
// sees, and a list screen's mobile create action reaches `AppHeader`
// through the DOM slot in `~/components/page/header-action-slot.tsx`.
describe("ListPageHeader", () => {
  it("renders the title as the page's <h1>", () => {
    render(<ListPageHeader title="Phòng" description="Quản lý phòng." />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Phòng" }),
    ).toBeInTheDocument();
  });

  it("portals `mobileAction` into the header's slot once it exists", async () => {
    render(
      <>
        <div id={HEADER_ACTION_SLOT_ID} />
        <ListPageHeader
          title="Phòng"
          description="Quản lý phòng."
          mobileAction={
            <button type="button" aria-label="Tạo phòng">
              +
            </button>
          }
        />
      </>,
    );

    const slot = document.getElementById(HEADER_ACTION_SLOT_ID);
    const button = await screen.findByRole("button", { name: "Tạo phòng" });
    expect(slot).toContainElement(button);
  });

  it("renders no `mobileAction` when AppHeader hasn't mounted the slot", () => {
    render(
      <ListPageHeader
        title="Phòng"
        description="Quản lý phòng."
        mobileAction={
          <button type="button" aria-label="Tạo phòng">
            +
          </button>
        }
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Tạo phòng" }),
    ).not.toBeInTheDocument();
  });
});
