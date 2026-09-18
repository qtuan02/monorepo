import { useEffect } from "react";
import { Outlet } from "react-router";

import SignOutButton from "~/features/auth/components/sign-out-button";
import { useAuthStore } from "~/stores/use-auth-store";
import { useSocketStore } from "~/stores/use-socket-store";

/**
 * The public surface of the `layout` slice, and the element every in-app
 * page nests under. Still a bare top bar: the `conversation` slice now owns
 * its own sidebar (see conversation-shell.template.tsx), but the source
 * app's persistent bottom-nav/profile chrome has nowhere to point yet until
 * friends/profile land in a later ticket.
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
        <SignOutButton />
      </header>
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
