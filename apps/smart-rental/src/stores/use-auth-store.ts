import { create } from "zustand";
import { persist } from "zustand/middleware";

/** The signed-in landlord, as the shell's nav-user shows them. */
export interface AuthUser {
  name: string;
  email: string;
}

interface AuthStore {
  token: string | null;
  user: AuthUser | null;
  signIn: (token: string, user: AuthUser) => void;
  logout: () => void;
}

/**
 * App-wide client state: the route guards, the HTTP client's token reader, and
 * the shell's nav-user all read it. Read it through a narrow selector
 * (`useAuthStore((s) => s.token)`) so a component re-renders only when the slice
 * it uses changes.
 *
 * `logout` is one function rather than clearing fields at each call site: it is
 * the single place to hang everything that must happen on sign-out, and callers
 * pick that up without changing.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      signIn: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "auth" },
  ),
);
