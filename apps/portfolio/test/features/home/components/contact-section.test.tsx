import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { messages } from "@monorepo/i18n/languages";

import ContactSection from "~/features/home/components/contact-section";
import { CONTACT_ITEMS } from "~/features/home/constants/resume";
import { render } from "../../../support/render";

const { labels, items } = messages.vi.portfolio.contact;

/**
 * A contact line is now a label and a value, and the decision in the
 * component is the same one v1 made: which values are links. A birthday and a
 * city are facts; a phone, an email and two profiles lead somewhere. Both the
 * join (label ↔ value, by id) and the link decision are pinned here, on what a
 * reader gets — the markup around them is the block's business.
 */
describe("ContactSection", () => {
  it("pairs every contact line with its label and its value", () => {
    render(<ContactSection />);

    for (const item of CONTACT_ITEMS) {
      const id = item.id as keyof typeof labels;

      expect(screen.getByText(labels[id]), `${item.id} label`).toBeVisible();
      expect(screen.getByText(items[id]), `${item.id} value`).toBeVisible();
    }
  });

  it("links only the lines that lead somewhere", () => {
    render(<ContactSection />);

    const linked = CONTACT_ITEMS.filter((item) => item.href);

    expect(screen.getAllByRole("link")).toHaveLength(linked.length);

    for (const item of linked) {
      expect(
        screen.getByRole("link", {
          name: items[item.id as keyof typeof items],
        }),
        item.id,
      ).toHaveAttribute("href", item.href);
    }

    // The two facts: no `href="#"` dressed up as a destination.
    expect(screen.queryByRole("link", { name: items.birthday })).toBeNull();
    expect(screen.queryByRole("link", { name: items.location })).toBeNull();
  });

  it("opens a web profile in a new tab and keeps tel:/mailto: in this one", () => {
    render(<ContactSection />);

    for (const id of ["github", "linkedin"] as const) {
      const link = screen.getByRole("link", { name: items[id] });

      expect(link, id).toHaveAttribute("target", "_blank");
      expect(link, id).toHaveAttribute("rel", "noreferrer");
    }

    for (const id of ["phone", "email"] as const) {
      const link = screen.getByRole("link", { name: items[id] });

      // A `tel:` or `mailto:` opens a handler, not a page — a new tab would be
      // a blank one left behind.
      expect(link, id).not.toHaveAttribute("target");
    }
  });
});
