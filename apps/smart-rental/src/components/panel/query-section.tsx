import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { ErrorPanel } from "~/components/panel/error-panel";

interface QuerySectionProps<TData> {
  query: UseQueryResult<TData, Error>;
  errorText: string;
  /** This section's own footprint (`~/components/card/kpi-strip`, `~/components/panel/loading-panel`) — every call site names one, no shared default. */
  loading: ReactNode;
  children: (data: TData) => ReactNode;
}

/**
 * One section's three states over one query — skeleton on the first load,
 * an error panel with "Thử lại", then the section itself with its data. A
 * screen built from several queries wraps each section on its own, so one
 * slow read never blanks the others (patterns-self-fetching-components.md).
 */
export function QuerySection<TData>({
  query,
  errorText,
  loading,
  children,
}: QuerySectionProps<TData>) {
  if (query.isLoading) return loading;
  if (query.isError || query.data === undefined) {
    return (
      <ErrorPanel
        description={errorText}
        action={{ label: "Thử lại", onClick: () => void query.refetch() }}
      />
    );
  }
  return children(query.data);
}
