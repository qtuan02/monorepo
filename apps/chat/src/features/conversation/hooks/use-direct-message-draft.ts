import { useLocation } from "react-router";

import { getDraftUserFromLocationState } from "~/features/conversation/utils/direct-message-draft";

/**
 * The Draft conversation's whole state — nothing else backs it (CONTEXT.md).
 * Reading `location.state` fresh on every render, rather than capturing it
 * into local state, is what makes it disappear on its own the moment the
 * visitor navigates anywhere else: a new location carries no state unless
 * something explicitly attaches it again.
 */
export function useDirectMessageDraft() {
  const location = useLocation();

  return getDraftUserFromLocationState(location.state);
}
