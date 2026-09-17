import { useSearchParams } from "react-router";

const TAB_PARAM = "tab";

/**
 * A screen's active tab on the URL (`?tab=`), so a reload or a shared link
 * lands on the same panel. The first entry of `tabs` is the default and is
 * kept off the URL; an unknown value falls back to it. Writes `replace`, so
 * switching tabs does not pile up Back entries.
 */
export function useUrlTab<const T extends readonly string[]>(
  tabs: T,
): [tab: T[number], setTab: (next: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get(TAB_PARAM);
  const tab = raw !== null && tabs.includes(raw) ? raw : tabs[0];

  const setTab = (next: string) =>
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);
        if (next === tabs[0]) params.delete(TAB_PARAM);
        else params.set(TAB_PARAM, next);
        return params;
      },
      { replace: true },
    );

  return [tab as T[number], setTab];
}
