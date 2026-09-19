import { useEffect } from "react";
import { Outlet, useLocation, useMatch } from "react-router";

import { useIsMobile } from "@monorepo/hook/use-is-mobile";

import { Island } from "~/components/island/island";
import { ROUTES } from "~/constants/routes";
import { useDirectMessageDraft } from "~/features/conversation/hooks/use-direct-message-draft";
import BottomNav from "~/features/layout/components/bottom-nav";
import NavRail from "~/features/layout/components/nav-rail";
import { useAuthStore } from "~/stores/use-auth-store";
import { useSocketStore } from "~/stores/use-socket-store";

/**
 * The public surface of the `layout` slice, and the element every in-app
 * page nests under — the Islands shell (CONTEXT.md, ADR-0016): `NavRail`
 * from `md`, `BottomNav` below it, and everything the route tree renders
 * inside one Island. Splitting today's single wrapping Island into the
 * list/pane pair `≥md` needs is each screen's own ticket (design brief §3.1
 * decision #23) — this frame does not commit to that shape yet.
 *
 * Also where the socket connects: subscribed to `token` (not read once via
 * `getState()`) so a refreshed token reconnects with a fresh `Authorization`
 * header, and a sign-out — which clears the token — disconnects through the
 * same effect cleanup.
 */
export default function LayoutTemplate() {
  const token = useAuthStore((state) => state.token);
  const connect = useSocketStore((state) => state.connect);
  const disconnect = useSocketStore((state) => state.disconnect);

  useEffect(() => {
    if (token) connect();
    return () => disconnect();
  }, [token, connect, disconnect]);

  const isMobile = useIsMobile();
  const location = useLocation();
  const conversationMatch = useMatch(ROUTES.CONVERSATION_BY_ID);
  const draftUser = useDirectMessageDraft();
  // The composer owns the bottom of the screen on a Conversation or Draft —
  // real or drafted, both read `location`/router state the same way
  // `ConversationShellTemplate` does (CONTEXT.md — Draft conversation).
  const isInConversationScreen =
    !!conversationMatch || (location.pathname === ROUTES.HOME && !!draftUser);

  return (
    <div className="flex min-h-dvh flex-col gap-2 p-2 md:h-dvh md:flex-row md:gap-3 md:p-3">
      {!isMobile && <NavRail />}
      <Island className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
      </Island>
      {isMobile && !isInConversationScreen && <BottomNav />}
    </div>
  );
}
