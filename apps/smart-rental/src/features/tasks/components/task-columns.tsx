import { createDataTableColumnHelper } from "@monorepo/ui/components/data-table";

import type { Task } from "~/types/task";
import { facetFilterFn } from "~/components/data-table/data-table";

const helper = createDataTableColumnHelper<Task>();

/**
 * The Việc cần làm table is never drawn — the screen is a card grid — but the
 * list composite still filters through these columns: `title` carries the
 * search (over the title AND the description, as the prototype searched), the
 * other three carry the facets.
 */
export const taskColumns = helper.columns([
  helper.accessor("title", {
    filterFn: (row, _columnId, filterValue: string) => {
      const needle = filterValue.trim().toLowerCase();
      return (
        row.original.title.toLowerCase().includes(needle) ||
        row.original.description.toLowerCase().includes(needle)
      );
    },
  }),
  helper.accessor("priority", { filterFn: facetFilterFn }),
  helper.accessor("status", { filterFn: facetFilterFn }),
  helper.accessor("type", { filterFn: facetFilterFn }),
]);
