import { useLocation, useMatch } from "react-router";

import { ROUTES } from "~/constants/routes";

/**
 * Which of the Rail's/Bottom nav's three destinations the current route
 * belongs to. A conversation screen counts as Chats — it is reached from
 * that list — even though its own path is not `ROUTES.HOME`.
 */
export function useNavActiveSection() {
  const location = useLocation();
  const conversationMatch = useMatch(ROUTES.CONVERSATION_BY_ID);

  return {
    chats: location.pathname === ROUTES.HOME || !!conversationMatch,
    friends: location.pathname === ROUTES.FRIENDS,
    profile: location.pathname === ROUTES.PROFILE,
  };
}
