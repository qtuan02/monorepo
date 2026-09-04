import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { ROUTES } from "~/constants/routes";
import HomeTemplate from "~/features/home/templates/home.template";

// The template is the seam: it is the highest point the module table, route
// wiring, i18n strings, and card anatomy all pass through. Asserting here —
// instead of on an isolated CardItem — catches a wrong route wired to a real
// module, which a hand-fed prop in an isolated test cannot.
function renderHomeTemplate() {
  return render(
    <MemoryRouter>
      <HomeTemplate />
    </MemoryRouter>,
  );
}

describe("HomeTemplate", () => {
  it("renders exactly one page heading, and the cards don't add a second one", () => {
    renderHomeTemplate();

    const level1Headings = screen.getAllByRole("heading", { level: 1 });
    expect(level1Headings).toHaveLength(1);
    expect(level1Headings[0]).toHaveTextContent("Phân hệ");
  });

  it("renders every module as a link to its route", () => {
    renderHomeTemplate();

    // Anchored at the start: a link's accessible name concatenates its
    // title AND its description, and one module's description can contain
    // another module's title as a substring (Dashboard's description
    // mentions patients). The title always comes first, so anchoring picks
    // the right link without also matching that collision.
    expect(
      screen.getByRole("link", { name: /^Bảng điều khiển/ }),
    ).toHaveAttribute("href", ROUTES.DASHBOARD);
    expect(screen.getByRole("link", { name: /^Hệ thống POS/ })).toHaveAttribute(
      "href",
      ROUTES.POS,
    );
    expect(
      screen.getByRole("link", { name: /^Quản lý bệnh nhân/ }),
    ).toHaveAttribute("href", ROUTES.PATIENTS);
    expect(
      screen.getByRole("link", { name: /^Quản lý thuốc/ }),
    ).toHaveAttribute("href", ROUTES.MEDICATIONS);
    expect(
      screen.getByRole("link", { name: /^Thống kê & Báo cáo/ }),
    ).toHaveAttribute("href", ROUTES.ANALYTICS);
    expect(screen.getByRole("link", { name: /^Lịch hẹn/ })).toHaveAttribute(
      "href",
      ROUTES.APPOINTMENTS,
    );
  });

  it("gives each card exactly one link, so a keyboard user gets one stop per module", () => {
    renderHomeTemplate();

    expect(screen.getAllByRole("link")).toHaveLength(6);
  });
});
