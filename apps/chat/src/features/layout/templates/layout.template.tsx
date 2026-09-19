import { useEffect } from "react";
import { Link, Outlet } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { ROUTES } from "~/constants/routes";
import { CurrentUserMenu } from "~/features/current-user/components/current-user-menu";
import { useAuthStore } from "~/stores/use-auth-store";
import { useSocketStore } from "~/stores/use-socket-store";

/**
 * The public surface of the `layout` slice, and the element every in-app
 * page nests under. The `conversation` slice owns its own sidebar (see
 * conversation-shell.template.tsx); this top bar carries the one piece of
 * chrome every page shares — the current-user area, with its own menu.
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

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-border flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-semibold">Chat</span>
        <nav className="flex items-center gap-2">
          <Link
            to={ROUTES.FRIENDS}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Friends
          </Link>
          <CurrentUserMenu />
        </nav>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
