import type { ReactNode } from "react";
import { Fragment } from "react";

import type { EmptyPanelProps } from "~/components/panel/empty-panel";
import { EmptyPanel } from "~/components/panel/empty-panel";

interface RelationTabProps<T extends { id: string }> {
  items: T[];
  /** Shown instead of the grid when `items` is empty. */
  empty: Pick<EmptyPanelProps, "icon" | "title" | "description">;
  /** One card per item. */
  children: (item: T) => ReactNode;
  /** Grid wrapper classes — default is the two-column card grid every detail screen already used. */
  className?: string;
}

/**
 * A detail screen's relation tab (Hoá đơn của Hợp đồng, Hợp đồng của Phòng,
 * …): a card grid, or an `EmptyPanel` with a hint when there is nothing —
 * "như hiện nay", written once (spec #221 ticket T5).
 */
export function RelationTab<T extends { id: string }>({
  items,
  empty,
  children,
  className = "grid gap-4 sm:grid-cols-2",
}: RelationTabProps<T>) {
  if (items.length === 0) {
    return <EmptyPanel {...empty} className="border" />;
  }

  return (
    <div className={className}>
      {items.map((item) => (
        <Fragment key={item.id}>{children(item)}</Fragment>
      ))}
    </div>
  );
}
