import { useSearchParams } from "react-router";

import { DEFAULT_PAGE_SIZE } from "~/utils/pagination";

/** The reserved keys; a facet uses its own column id, so none may collide with these. */
export const SEARCH_PARAM = "q";
export const PAGE_PARAM = "page";
export const PAGE_SIZE_PARAM = "size";
export const SORT_PARAM = "sort";

/** One column's sort, the only entry `TableSort` carries — no multi-sort on the URL. */
export interface TableSort {
  columnId: string;
  desc: boolean;
}

export interface TableSearchParams {
  search: string;
  /** 1-based, unclamped — the table knows the page count, this hook does not. */
  page: number;
  pageSize: number;
  /** Selected values per facet column id; an absent key is an empty selection. */
  facets: Record<string, string[]>;
  /** `null` once a caller with no `defaultSort` shows the data in its own order. */
  sort: TableSort | null;
}

export type TableSearchParamsPatch = Partial<
  Omit<TableSearchParams, "facets" | "sort"> & {
    facets: Record<string, string[]>;
    sort: TableSort | null;
  }
>;

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/** `dueDate` (asc) / `-dueDate` (desc) — one column, one URL token. */
function encodeSort(sort: TableSort): string {
  return sort.desc ? `-${sort.columnId}` : sort.columnId;
}

function decodeSort(raw: string | null): TableSort | null {
  if (!raw) return null;
  return raw.startsWith("-")
    ? { columnId: raw.slice(1), desc: true }
    : { columnId: raw, desc: false };
}

function sortEquals(a: TableSort | null, b: TableSort | null): boolean {
  if (a === null || b === null) return a === b;
  return a.columnId === b.columnId && a.desc === b.desc;
}

/**
 * The list state a reload must keep — search, facets, page, page size, sort —
 * read from and written to the URL through `useSearchParams` (spec #127: no
 * `nuqs`). Writes `replace` history so paging does not pile up Back entries,
 * and drops a key at its default so a plain `/rooms` stays a plain `/rooms`.
 *
 * `defaultSort` is the list's own order (spec #179 §3.6) — a reload with no
 * `?sort=` still shows it, and sorting back to it drops the param rather than
 * writing it out.
 */
export function useTableSearchParams(
  facetIds: readonly string[],
  defaultSort: TableSort | null = null,
) {
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
    sort: decodeSort(searchParams.get(SORT_PARAM)) ?? defaultSort,
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
        if (patch.sort !== undefined) {
          // Only a sort that DIFFERS from the list's own default is worth a
          // param — `null` (explicitly cleared) falls back to it too, same
          // as every other key here dropping to its default.
          if (sortEquals(patch.sort, defaultSort) || patch.sort === null) {
            next.delete(SORT_PARAM);
          } else {
            next.set(SORT_PARAM, encodeSort(patch.sort));
          }
        }
        return next;
      },
      { replace: true },
    );
  };

  return { params, setParams };
}
