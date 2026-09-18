import { vi } from "vitest";

type MutableMediaQueryList = MediaQueryList & { matches: boolean };

/**
 * jsdom ships no `matchMedia`. The mock keeps one list per query so a spec can
 * flip `matches` and fire `change` exactly as a real viewport would — the
 * `documents` and `smart-rental` setups stub it too, but as a dead
 * `matches: false` that can never change.
 */
export function installMatchMedia() {
  const lists = new Map<string, MutableMediaQueryList>();

  window.matchMedia = vi.fn((query: string) => {
    let list = lists.get(query);
    if (!list) {
      list = Object.assign(new EventTarget(), {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }) as MutableMediaQueryList;
      lists.set(query, list);
    }
    return list;
  });

  return {
    setMatches(query: string, matches: boolean) {
      const list = window.matchMedia(query) as MutableMediaQueryList;
      list.matches = matches;
      list.dispatchEvent(new Event("change"));
    },
  };
}
