import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

/**
 * App-wide client state: the route guards, the HTTP client's token reader, and
 * the header all read it. Read it through a narrow selector
 * (`useAuthStore((s) => s.token)`) so a component re-renders only when the slice
 * it uses changes.
 *
 * `logout` is one function rather than `setToken(null)` at each call site: it is
 * the single place to hang everything that must happen on sign-out, and callers
 * pick that up without changing.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      logout: () => set({ token: null }),
    }),
    { name: "auth" },
  ),
);
