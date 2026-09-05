import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@monorepo/ui/components/command";

// cmdk marks the active item with a VALUE attribute, not a bare boolean one the
// way a Base UI primitive would: every item renders `data-selected`, and only the
// active one carries `"true"`. Tailwind's bare `data-selected:` variant matches
// on attribute PRESENCE, so spelling it that way — as the base-vega registry
// does — highlights the whole list at once. These two assertions pin the shape
// the styling depends on, and the spelling that reads it.
describe("Command — the active item", () => {
  test("is the only one marked, and is styled by value rather than presence", () => {
    render(
      <Command>
        <CommandInput placeholder="Tìm lệnh" />
        <CommandList>
          <CommandGroup heading="Gợi ý">
            <CommandItem>Lịch</CommandItem>
            <CommandItem>Hồ sơ</CommandItem>
            <CommandItem>Cài đặt</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    const items = Array.from(
      document.querySelectorAll('[data-slot="command-item"]'),
    );

    expect(items.map((item) => item.getAttribute("data-selected"))).toEqual([
      "true",
      "false",
      "false",
    ]);

    for (const item of items) {
      expect(item.className).toContain("data-[selected=true]:bg-muted");
      expect(item.className).not.toMatch(/(^|[\s:])data-selected:/);
    }
  });
});
