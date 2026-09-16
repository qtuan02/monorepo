import type { StaticImageData } from "next/image";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ResumeCard } from "~/features/home/components/resume-card";
import { render } from "../../../support/render";

/** What a static image import evaluates to — enough for `next/image` to size. */
const logo: StaticImageData = { src: "/logo.png", width: 48, height: 48 };

const bullets = [
  { id: "monorepo", text: "Monorepo frontend và module Khám sức khoẻ" },
  { id: "mobile", text: "App EMR mobile bằng Expo/React Native" },
];

/**
 * The row has one decision in it and everything else is markup: a role with a
 * body is an expandable accordion header, a school without one is a plain link
 * out. Getting that branch wrong is silent — both shapes look identical until
 * someone tabs to the row.
 */
describe("ResumeCard", () => {
  it("renders an expandable header when the row has a body", () => {
    render(
      <ResumeCard
        logo={logo}
        altText="MedViet"
        title="MedViet"
        period="03/2026 – Hiện tại"
        bullets={bullets}
        toggleLabel="Xem chi tiết công việc"
      />,
    );

    const toggle = screen.getByRole("button", {
      name: "Xem chi tiết công việc",
    });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    // The heading wraps the button, so the row is one Tab stop that announces
    // its own state — the WAI-ARIA accordion shape.
    expect(screen.getByRole("heading", { level: 3 })).toContainElement(toggle);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("flips the expanded state when the header is activated", async () => {
    const user = userEvent.setup();

    render(
      <ResumeCard
        logo={logo}
        altText="MedViet"
        title="MedViet"
        period="03/2026 – Hiện tại"
        bullets={bullets}
        toggleLabel="Xem chi tiết công việc"
      />,
    );

    const toggle = screen.getByRole("button", {
      name: "Xem chi tiết công việc",
    });

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("opens expanded when the caller asks for it", () => {
    render(
      <ResumeCard
        defaultExpanded
        logo={logo}
        altText="MedViet"
        title="MedViet"
        period="03/2026 – Hiện tại"
        bullets={bullets}
        toggleLabel="Xem chi tiết công việc"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Xem chi tiết công việc" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("is a real link, not a button, when there is nothing to expand", () => {
    render(
      <ResumeCard
        logo={logo}
        altText="Saigon Technology University"
        title="Saigon Technology University"
        subtitle="Kỹ sư Công nghệ thông tin"
        period="2020 – 2024"
        href="https://stu.edu.vn"
        toggleLabel="Xem chi tiết công việc"
      />,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://stu.edu.vn",
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the award badge beside the period when the row carries one", () => {
    render(
      <ResumeCard
        logo={logo}
        altText="AROBID"
        title="AROBID"
        period="03/2025 – 02/2026"
        award={{ label: "VDA 2025", tooltip: "Vietnam Digital Awards 2025" }}
        bullets={bullets}
        toggleLabel="Xem chi tiết công việc"
      />,
    );

    expect(screen.getByText("VDA 2025")).toBeInTheDocument();
    // The badge takes no tab stop — it sits inside the toggle — and the
    // toggle's `aria-label` swallows its text, so the tooltip alone would leave
    // the award readable by mouse only. The description is what carries it to a
    // screen reader and to a phone.
    expect(
      screen.getByRole("button", { name: "Xem chi tiết công việc" }),
    ).toHaveAccessibleDescription("Vietnam Digital Awards 2025");
  });

  it("renders no badge for a row with no award", () => {
    render(
      <ResumeCard
        logo={logo}
        altText="MedViet"
        title="MedViet"
        period="03/2026 – Hiện tại"
        bullets={bullets}
        toggleLabel="Xem chi tiết công việc"
      />,
    );

    expect(screen.queryByText("VDA 2025")).not.toBeInTheDocument();
  });

  it("takes a folded body out of the accessibility tree, but not out of the markup", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <ResumeCard
        logo={logo}
        altText="MedViet"
        title="MedViet"
        period="03/2026 – Hiện tại"
        bullets={bullets}
        toggleLabel="Xem chi tiết công việc"
      />,
    );

    const toggle = screen.getByRole("button", {
      name: "Xem chi tiết công việc",
    });
    const bodySelector = `#${CSS.escape(toggle.getAttribute("aria-controls") ?? "")}`;

    // In the markup either way — that is what keeps a crawler reading a folded
    // role — but hidden from a screen reader, which would otherwise read
    // bullets belonging to a row that has just announced itself collapsed.
    expect(container.querySelector(bodySelector)).toHaveAttribute("inert");
    expect(
      screen.getByText("Monorepo frontend và module Khám sức khoẻ"),
    ).toBeInTheDocument();

    await user.click(toggle);

    expect(container.querySelector(bodySelector)).not.toHaveAttribute("inert");
  });

  it("opens the award's full name in a tooltip when a pointer rests on the badge", async () => {
    // The badge's text is the short form ("VDA 2025"); the full name is what a
    // recruiter hovering it wants. The description above carries it to
    // everyone else — this is the pointer's half of the same promise. A
    // `className` would say nothing here: whether a tooltip opens is a runtime
    // decision of the trigger, and jsdom is enough to watch it.
    const user = userEvent.setup();

    const { baseElement } = render(
      <ResumeCard
        logo={logo}
        altText="AROBID"
        title="AROBID"
        period="03/2025 – 02/2026"
        award={{ label: "VDA 2025", tooltip: "Vietnam Digital Awards 2025" }}
        bullets={bullets}
        toggleLabel="Xem chi tiết công việc"
      />,
    );

    await user.hover(screen.getByText("VDA 2025"));

    // Base UI's popup carries no `role="tooltip"` — the trigger is described
    // by it instead — and the full name is already in the markup as the
    // sr-only description, so `findByText` would match twice. The popup is
    // found by the `data-slot` every primitive stamps on its root, exactly as
    // `e2e/accent.e2e.ts` finds a badge and a card. The wait covers the
    // trigger's 600 ms hover delay.
    await waitFor(
      () =>
        expect(
          baseElement.querySelector('[data-slot="tooltip-content"]'),
        ).toHaveTextContent("Vietnam Digital Awards 2025"),
      { timeout: 2000 },
    );
  });

  it("keeps the tech stack behind the same body as the bullets", () => {
    render(
      <ResumeCard
        defaultExpanded
        logo={logo}
        altText="MedViet"
        title="MedViet"
        period="03/2026 – Hiện tại"
        techStack={["React.js", "PostgreSQL"]}
        techStackLabel="Công nghệ:"
        toggleLabel="Xem chi tiết công việc"
      />,
    );

    // A row with only a tech stack still counts as having a body — otherwise it
    // would render as a link with no href.
    expect(
      screen.getByRole("button", { name: "Xem chi tiết công việc" }),
    ).toBeInTheDocument();
    expect(screen.getByText("React.js, PostgreSQL")).toBeInTheDocument();
  });
});
