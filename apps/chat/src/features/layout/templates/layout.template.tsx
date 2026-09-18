import { Outlet } from "react-router";

import SignOutButton from "~/features/auth/components/sign-out-button";

/**
 * The public surface of the `layout` slice, and the element every in-app
 * page nests under. Still a bare top bar: the `conversation` slice now owns
 * its own sidebar (see conversation-shell.template.tsx), but the source
 * app's persistent bottom-nav/profile chrome has nowhere to point yet until
 * friends/profile land in a later ticket.
 */
export default function LayoutTemplate() {
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
