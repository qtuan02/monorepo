import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * The DOM id `AppHeader` (`~/features/layout`) mounts its mobile
 * create-action slot at, below `md` (round 4 §10 Q12). A list screen's own
 * template owns the create handler as component state (a `FormSheet`'s
 * `open`), and `AppHeader` sits in a different branch of the shell than the
 * routed page — so the two reach each other through this plain DOM id
 * rather than `~/features/layout` importing a feature, or a feature
 * importing it back (see [[architecture-circular-dependencies]]).
 */
export const HEADER_ACTION_SLOT_ID = "header-action-slot";

/**
 * Rendered by `ListPageHeader` when a list screen passes `mobileAction`:
 * portals it into the header's slot once that element exists. Looked up by
 * id rather than threaded through context, since the slot and this portal
 * mount in the same commit — by the time either side's effect runs, both
 * are already in the DOM.
 */
export function HeaderActionPortal({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.getElementById(HEADER_ACTION_SLOT_ID));
  }, []);

  if (!slot) return null;
  return createPortal(children, slot);
}
