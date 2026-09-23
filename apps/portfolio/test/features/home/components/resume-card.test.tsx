import type { StaticImageData } from "next/image";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import ResumeCard from "~/features/home/components/resume-card";
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
      name: /Xem chi tiết công việc/,
    });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    // The heading wraps the button, so the row is one Tab stop that announces
    // its own state — the WAI-ARIA accordion shape. Its name keeps the
    // organisation in front of the toggle's label: an `aria-label` on the
    // button would make every Work heading read as the same three words.
    const heading = screen.getByRole("heading", {
      level: 3,
      name: /^MedViet.*Xem chi tiết công việc$/,
    });
    expect(heading).toContainElement(toggle);
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
      name: /Xem chi tiết công việc/,
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
      screen.getByRole("button", { name: /Xem chi tiết công việc/ }),
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

  it("renders the company blurb muted, under the role", () => {
    render(
      <ResumeCard
        logo={logo}
        altText="MedViet"
        title="MedViet"
        subtitle="Kỹ sư phần mềm"
        summary="Sản phẩm EMR/HIS cho bệnh viện"
        period="03/2026 – Hiện tại"
        bullets={bullets}
        toggleLabel="Xem chi tiết công việc"
      />,
    );

    const summary = screen.getByText("Sản phẩm EMR/HIS cho bệnh viện");

    expect(summary).toHaveClass("text-muted-foreground");
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
      name: /Xem chi tiết công việc/,
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
      screen.getByRole("button", { name: /Xem chi tiết công việc/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("React.js, PostgreSQL")).toBeInTheDocument();
  });
});
