import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import MessageComposerEmojiPickerPanel from "~/features/conversation/components/message-composer-emoji-picker-panel";

function renderedEmoji() {
  return screen
    .getAllByRole("button")
    .filter((button) => button.hasAttribute("title"))
    .map((button) => button.textContent);
}

describe("MessageComposerEmojiPickerPanel", () => {
  it("shows one category at a time — the tab picks which — and hands the chosen emoji up", async () => {
    const user = userEvent.setup();
    const onEmojiSelect = vi.fn();
    render(<MessageComposerEmojiPickerPanel onEmojiSelect={onEmojiSelect} />);

    expect(
      within(screen.getByRole("tablist")).getAllByRole("tab"),
    ).toHaveLength(8);
    const smileys = renderedEmoji();
    expect(smileys).toContain("😀");
    expect(smileys).not.toContain("🍕");

    await user.click(screen.getByRole("tab", { name: "Food & drink" }));

    const food = renderedEmoji();
    expect(food).toContain("🍕");
    expect(food).not.toContain("😀");

    await user.click(screen.getByRole("button", { name: "pizza" }));
    expect(onEmojiSelect).toHaveBeenCalledWith("🍕");
  });

  it("searches label and tags across every category, and says so when nothing matches", async () => {
    const user = userEvent.setup();
    render(<MessageComposerEmojiPickerPanel onEmojiSelect={vi.fn()} />);

    await user.type(screen.getByRole("searchbox"), "pizza");
    expect(await screen.findByRole("button", { name: "pizza" })).toBeVisible();
    expect(renderedEmoji()).not.toContain("😀");

    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "zzzzzz");
    expect(await screen.findByText("No emoji found.")).toBeVisible();
  });
});
