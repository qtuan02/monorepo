import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HeroSection from "~/features/home/components/hero-section";
import { render } from "../../../support/render";

/**
 * The hero is the whole of what a five-second reader and an unfurl preview
 * see, and since v2 it is dressed as a terminal window. What is worth pinning
 * is not the dressing but what it must not cost: the name is still the page's
 * one `<h1>`, the positioning still lands above the fold, a screen reader
 * still hears the candidate before any of the theatre, and the four quick
 * actions still do what they did — which of them leave the page, and which
 * hand off to another application instead.
 */
describe("HeroSection", () => {
  it("names the candidate as the h1 and says what they do, above the fold", () => {
    render(<HeroSection />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Huynh Quoc Tuan",
    );
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText(/Driven by new technology/)).toBeInTheDocument();
    // The current employer belongs to the work history, not to the hero
    // (#274) — a line here would spend the page's most-read row on something
    // the reader gets two blocks down anyway.
    expect(screen.queryByText(/MedViet/)).not.toBeInTheDocument();
  });

  it("keeps the command lines and the window chrome out of the accessibility tree", () => {
    const { container } = render(<HeroSection />);

    // A sighted reader gets `$ whoami` before the name; a screen reader must
    // not get "dollar whoami". Every prompt, every command and the title bar
    // are decoration, so each sits under an `aria-hidden` ancestor.
    for (const command of ["whoami", "cat role.txt", "cat motto.txt"]) {
      expect(
        screen.getByText(command).closest('[aria-hidden="true"]'),
        command,
      ).not.toBeNull();
    }

    for (const prompt of screen.getAllByText("$")) {
      expect(prompt.closest('[aria-hidden="true"]')).not.toBeNull();
    }

    expect(
      screen.getByText("tuan@portfolio:~").closest('[aria-hidden="true"]'),
    ).not.toBeNull();

    // And the heading itself carries none of it: what is announced for the
    // page's h1 is the name and nothing else.
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /^Huynh Quoc Tuan$/,
    );

    // The name reaches a screen reader before the positioning — the order the
    // ticket fixes — and neither is inside anything hidden.
    const spoken = [...container.querySelectorAll("h1, p")].filter(
      (node) => node.closest('[aria-hidden="true"]') === null,
    );

    expect(spoken[0]).toHaveTextContent("Huynh Quoc Tuan");
    expect(spoken[1]).toHaveTextContent("Software Engineer");
  });

  it("no longer waves", () => {
    render(<HeroSection />);

    // The greeting and its emoji went with the redesign: the h1 is the name.
    expect(screen.queryByText("👋")).not.toBeInTheDocument();
    expect(screen.queryByText(/Hello/)).not.toBeInTheDocument();
  });

  it("offers exactly three quick actions, all of them links", () => {
    render(<HeroSection />);

    // Every control in the block, in DOM order. "In CV" was a fourth, and the
    // one real `<button>` among them; it is parked until it can hand over a
    // PDF (see the TODO in `hero-section.tsx`), so a `<button>` reappearing
    // here is that control coming back by accident rather than on purpose.
    const actions = [
      ...screen.getAllByRole("link"),
      ...screen.queryAllByRole("button"),
    ].sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );

    expect(actions.map((action) => action.textContent)).toEqual([
      "Email",
      "GitHub",
      "LinkedIn",
    ]);
  });

  it("opens a page in a new tab but hands a mailto off to the mail client", () => {
    render(<HeroSection />);

    const email = screen.getByRole("link", { name: "Email" });
    const github = screen.getByRole("link", { name: "GitHub" });
    const linkedin = screen.getByRole("link", { name: "LinkedIn" });

    expect(email).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
    expect(email).not.toHaveAttribute("target");

    for (const link of [github, linkedin]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    }
  });
});
