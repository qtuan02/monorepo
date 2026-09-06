import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProjectCard from "~/features/home/components/project-card";
import { render } from "../../../support/render";

const sourceLabels = {
  repo: "Mã nguồn",
  frontend: "Mã nguồn (FE)",
  backend: "Mã nguồn (BE)",
} as const;

const baseProps = {
  name: "Real-time Chat",
  typeLabel: "Cá nhân",
  description: "Ứng dụng chat thời gian thực.",
  bullets: [
    { id: "auth", text: "Phiên JWT trên Spring Security." },
    { id: "realtime", text: "Tin nhắn qua STOMP." },
  ],
  techStack: ["React", "Spring Boot"],
  sourceLabels,
  demoLabel: "Xem demo",
};

/**
 * The card has one decision in it: which links exist. A CV card that renders a
 * "Xem demo" link with no href is a dead control a recruiter clicks on, and one
 * that hides a repo it has the URL for is worse — so both directions are pinned
 * here, on the rendered links rather than on the markup around them.
 */
describe("ProjectCard", () => {
  it("renders exactly one link when the project has a source and no demo", () => {
    render(
      <ProjectCard
        {...baseProps}
        source={[{ id: "repo", href: "https://github.com/qtuan02/monorepo" }]}
      />,
    );

    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("Mã nguồn");
    expect(links[0]).toHaveAttribute(
      "href",
      "https://github.com/qtuan02/monorepo",
    );
  });

  it("renders a source link and a demo link when the project has both", () => {
    render(
      <ProjectCard
        {...baseProps}
        source={[{ id: "repo", href: "https://github.com/qtuan02/monorepo" }]}
        demo="https://portfolio-ui-2025.vercel.app"
      />,
    );

    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Xem demo" })).toHaveAttribute(
      "href",
      "https://portfolio-ui-2025.vercel.app",
    );
  });

  it("renders no link at all when the project has no URL", () => {
    render(<ProjectCard {...baseProps} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("labels a split frontend/backend source so the two links can be told apart", () => {
    render(
      <ProjectCard
        {...baseProps}
        source={[
          { id: "frontend", href: "https://github.com/qtuan02/chat-socket-fe" },
          { id: "backend", href: "https://github.com/qtuan02/chat-socket-be" },
        ]}
        demo="https://chat-socket-fe.vercel.app"
      />,
    );

    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Mã nguồn (FE)" })).toHaveAttribute(
      "href",
      "https://github.com/qtuan02/chat-socket-fe",
    );
    expect(screen.getByRole("link", { name: "Mã nguồn (BE)" })).toHaveAttribute(
      "href",
      "https://github.com/qtuan02/chat-socket-be",
    );
  });

  it("opens every link in a new tab without leaking the referrer", () => {
    render(
      <ProjectCard
        {...baseProps}
        source={[{ id: "repo", href: "https://github.com/qtuan02/monorepo" }]}
        demo="https://portfolio-ui-2025.vercel.app"
      />,
    );

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    }
  });

  it("keeps each tech badge on one line", () => {
    render(<ProjectCard {...baseProps} />);

    // A chip that wraps mid-name ("Spring" / "Boot") reads as two skills.
    expect(screen.getByText("Spring Boot")).toHaveClass("whitespace-nowrap");
  });

  it("names the project with a heading and renders the type badge and bullets", () => {
    render(<ProjectCard {...baseProps} />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Real-time Chat" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cá nhân")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(
      expect.arrayContaining([
        "Phiên JWT trên Spring Security.",
        "Tin nhắn qua STOMP.",
      ]),
    );
  });
});
