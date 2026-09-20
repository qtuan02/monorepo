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
 * reload keeps it. `defaultView` is written as no param at all — every list
 * defaults to `table` (spec #179 §3.6) except Phòng, the one screen still
 * passing `"grid"`.
 */
export function useListView(
  defaultView: ListView = "table",
): [ListView, (next: ListView) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get(VIEW_PARAM);
  const view: ListView = raw === "grid" || raw === "table" ? raw : defaultView;

  const setView = (next: ListView) =>
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        if (next === defaultView) params.delete(VIEW_PARAM);
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
 * below `md`: at phone width `DataTable` folds the same two choices into its
 * own "⋯" menu instead, so the toolbar stays one row (round 4 Q17 T2).
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
