import { useSearchParams } from "react-router";

import { DEFAULT_PAGE_SIZE } from "~/utils/pagination";

/** The reserved keys; a facet uses its own column id, so none may collide with these. */
export const SEARCH_PARAM = "q";
export const PAGE_PARAM = "page";
export const PAGE_SIZE_PARAM = "size";

export interface TableSearchParams {
  search: string;
  /** 1-based, unclamped — the table knows the page count, this hook does not. */
  page: number;
  pageSize: number;
  /** Selected values per facet column id; an absent key is an empty selection. */
  facets: Record<string, string[]>;
}

export type TableSearchParamsPatch = Partial<
  Omit<TableSearchParams, "facets"> & { facets: Record<string, string[]> }
>;

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * The list state a reload must keep — search, facets, page, page size — read
 * from and written to the URL through `useSearchParams` (spec #127: no `nuqs`).
 * Writes `replace` history so paging does not pile up Back entries, and drops
 * a key at its default so a plain `/rooms` stays a plain `/rooms`.
 */
export function useTableSearchParams(facetIds: readonly string[]) {
  const [searchParams, setSearchParams] = useSearchParams();

  const facets: Record<string, string[]> = {};
  for (const id of facetIds) {
    facets[id] = (searchParams.get(id) ?? "").split(",").filter(Boolean);
  }

  const params: TableSearchParams = {
    search: searchParams.get(SEARCH_PARAM) ?? "",
    page: parsePositiveInt(searchParams.get(PAGE_PARAM), 1),
    pageSize: parsePositiveInt(
      searchParams.get(PAGE_SIZE_PARAM),
      DEFAULT_PAGE_SIZE,
    ),
    facets,
  };

  const setParams = (patch: TableSearchParamsPatch) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        const write = (key: string, value: string, defaultValue: string) => {
          if (value === defaultValue) next.delete(key);
          else next.set(key, value);
        };

        if (patch.search !== undefined) write(SEARCH_PARAM, patch.search, "");
        if (patch.page !== undefined)
          write(PAGE_PARAM, String(patch.page), "1");
        if (patch.pageSize !== undefined) {
          write(
            PAGE_SIZE_PARAM,
            String(patch.pageSize),
            String(DEFAULT_PAGE_SIZE),
          );
        }
        for (const [id, values] of Object.entries(patch.facets ?? {})) {
          write(id, values.join(","), "");
        }
        return next;
      },
      { replace: true },
    );
  };

  return { params, setParams };
}
