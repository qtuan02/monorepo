import { Outlet } from "react-router";

import SignOutButton from "~/features/auth/components/sign-out-button";

/**
 * The public surface of the `layout` slice, and the element every in-app
 * page nests under. The real sidebar/bottom-nav chrome (per the source app)
 * has nowhere to point yet — every destination it would link to
 * (conversation, friends, profile) lands in a later ticket — so this stays a
 * bare frame with a working sign-out until one exists.
 */
export default function LayoutTemplate() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-border flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-semibold">Chat</span>
        <SignOutButton />
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
