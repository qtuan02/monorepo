import { LayoutGrid, List } from "lucide-react";
import { useSearchParams } from "react-router";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@monorepo/ui/components/toggle-group";

const VIEW_PARAM = "view";

export type ListView = "grid" | "table";

/**
 * A list screen's cards/table choice, on the URL beside the filters so a
 * reload keeps it. `grid` is the default and is written as no param at all.
 */
export function useListView(): [ListView, (next: ListView) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const view: ListView =
    searchParams.get(VIEW_PARAM) === "table" ? "table" : "grid";

  const setView = (next: ListView) =>
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        if (next === "grid") params.delete(VIEW_PARAM);
        else params.set(VIEW_PARAM, next);
        return params;
      },
      { replace: true },
    );

  return [view, setView];
}

interface ListViewSwitchProps {
  view: ListView;
  onViewChange: (next: ListView) => void;
}

/**
 * "Dạng thẻ / Dạng bảng" — a real `ToggleGroup` (spec #153 §10 row —
 * component map: a switch has no panel, so `Tabs` was the wrong semantics).
 * A single active value can't be toggled off: `next[0]` is only ever
 * undefined when the pressed item was already the one selected. Hidden
 * below `md`: a phone-width screen already gets the mobile substitute for
 * whichever view is current (a card grid stacks on its own, a table gives
 * way to `renderMobileRow`), so the choice itself is moot there.
 */
export function ListViewSwitch({ view, onViewChange }: ListViewSwitchProps) {
  return (
    <ToggleGroup
      value={[view]}
      onValueChange={(next) => {
        const value = next[0];
        if (value) onViewChange(value as ListView);
      }}
      variant="outline"
      size="sm"
      spacing={0}
      className="hidden md:inline-flex"
    >
      <ToggleGroupItem value="grid" aria-label="Dạng thẻ">
        <LayoutGrid />
        <span className="hidden sm:inline">Dạng thẻ</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Dạng bảng">
        <List />
        <span className="hidden sm:inline">Dạng bảng</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
