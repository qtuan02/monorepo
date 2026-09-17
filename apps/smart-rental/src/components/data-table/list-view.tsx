import type { ReactNode } from "react";
import { LayoutGrid, List } from "lucide-react";
import { useSearchParams } from "react-router";

import { Tabs, TabsList, TabsTrigger } from "@monorepo/ui/components/tabs";

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

interface ListViewTabsProps {
  view: ListView;
  onViewChange: (next: ListView) => void;
  children: ReactNode;
}

/** The `Tabs` root around a `DataTable`; hand `<ListViewSwitch />` to its `viewSwitch`. */
export function ListViewTabs({
  view,
  onViewChange,
  children,
}: ListViewTabsProps) {
  return (
    <Tabs
      value={view}
      onValueChange={(value) => onViewChange(value as ListView)}
    >
      {children}
    </Tabs>
  );
}

/** "Dạng thẻ / Dạng bảng" — the trigger pair every list screen shows at the right of its result line. */
export function ListViewSwitch() {
  return (
    <TabsList className="bg-muted/50">
      <TabsTrigger value="grid">
        <LayoutGrid />
        <span className="hidden sm:inline">Dạng thẻ</span>
      </TabsTrigger>
      <TabsTrigger value="table">
        <List />
        <span className="hidden sm:inline">Dạng bảng</span>
      </TabsTrigger>
    </TabsList>
  );
}
