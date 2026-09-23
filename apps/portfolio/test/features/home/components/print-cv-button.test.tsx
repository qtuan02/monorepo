import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import PrintCvButton from "~/features/home/components/print-cv-button";
import { render } from "../../../support/render";

/**
 * The one hero action that is not a link. It exists because the page itself is
 * the CV — there is no PDF to download — so the print dialog is the whole
 * feature, and `window.print()` is the only thing worth asserting.
 */
describe("PrintCvButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens the print dialog when activated", async () => {
    const user = userEvent.setup();
    // jsdom declares `window.print` and throws "not implemented" when called,
    // so it has to be stubbed rather than merely spied on.
    const print = vi.fn();
    vi.stubGlobal("print", print);

    render(<PrintCvButton />);

    await user.click(screen.getByRole("button", { name: "Print CV" }));

    expect(print).toHaveBeenCalledOnce();
  });

  it("is a real button, not a link dressed as one", () => {
    render(<PrintCvButton />);

    // Printing is an action on the current page, not a destination. A link
    // would announce as one and offer a meaningless "open in new tab".
    expect(screen.getByRole("button", { name: "Print CV" })).toHaveAttribute(
      "type",
      "button",
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
