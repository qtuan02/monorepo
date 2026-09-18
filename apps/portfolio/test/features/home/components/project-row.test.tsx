import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProjectRow from "~/features/home/components/project-row";
import { render } from "../../../support/render";

const sourceLabels = {
  repo: "Mã nguồn",
  frontend: "Mã nguồn (FE)",
  backend: "Mã nguồn (BE)",
} as const;

const baseProps = {
  name: "Real-time Chat",
  description: "Ứng dụng chat thời gian thực.",
  techStack: ["React", "Spring Boot"],
  sourceLabels,
  demoLabel: "Xem demo",
};

/**
 * The row has one decision in it: which links exist. A CV row that renders a
 * "Xem demo" link with no href is a dead control a recruiter clicks on, and one
 * that hides a repo it has the URL for is worse — so both directions are pinned
 * here, on the rendered links rather than on the markup around them.
 */
describe("ProjectRow", () => {
  it("renders exactly one link when the project has a source and no demo", () => {
    render(
      <ProjectRow
        {...baseProps}
        source={[{ id: "repo", href: "https://github.com/qtuan02/chat" }]}
      />,
    );

    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "https://github.com/qtuan02/chat");
    expect(links[0]).toHaveTextContent("Mã nguồn");
  });

  it("renders a source link and a demo link when the project has both", () => {
    render(
      <ProjectRow
        {...baseProps}
        source={[{ id: "repo", href: "https://github.com/qtuan02/chat" }]}
        demo="https://chat.example"
      />,
    );

    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Xem demo" })).toHaveAttribute(
      "href",
      "https://chat.example",
    );
  });

  it("renders no link at all when the project has no URL", () => {
    render(<ProjectRow {...baseProps} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("labels a split frontend/backend source so the two links can be told apart", () => {
    render(
      <ProjectRow
        {...baseProps}
        source={[
          { id: "frontend", href: "https://github.com/qtuan02/chat-fe" },
          { id: "backend", href: "https://github.com/qtuan02/chat-be" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Mã nguồn (FE)" })).toHaveAttribute(
      "href",
      "https://github.com/qtuan02/chat-fe",
    );
    expect(screen.getByRole("link", { name: "Mã nguồn (BE)" })).toHaveAttribute(
      "href",
      "https://github.com/qtuan02/chat-be",
    );
  });

  it("opens every link in a new tab without leaking the referrer", () => {
    render(
      <ProjectRow
        {...baseProps}
        source={[{ id: "repo", href: "https://github.com/qtuan02/chat" }]}
        demo="https://chat.example"
      />,
    );

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    }
  });

  it("names the project with a heading and writes the stack as one line", () => {
    render(<ProjectRow {...baseProps} />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Real-time Chat" }),
    ).toBeInTheDocument();
    // Text, not chips: a demo project's stack is a line a reader skims, and a
    // chip per name was what made three demos read like three products.
    expect(screen.getByText("React · Spring Boot")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("draws no block of its own — the section's block holds the rows", () => {
    const { container } = render(<ProjectRow {...baseProps} />);

    expect(
      container.querySelectorAll('[data-slot="standard-block"]'),
    ).toHaveLength(0);
  });
});
