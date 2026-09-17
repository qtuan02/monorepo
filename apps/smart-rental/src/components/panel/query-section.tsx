import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { ErrorPanel } from "~/components/panel/error-panel";
import { LoadingPanel } from "~/components/panel/loading-panel";

interface QuerySectionProps<TData> {
  query: UseQueryResult<TData, Error>;
  errorText: string;
  /** The skeleton for this section's footprint; the default card grid otherwise. */
  loading?: ReactNode;
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
  loading = <LoadingPanel />,
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
