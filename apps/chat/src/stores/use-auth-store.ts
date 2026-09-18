import { create } from "zustand";

interface AuthStore {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

/**
 * The access-token half of Session (CONTEXT.md): deliberately NOT persisted.
 * The other half — the `HttpOnly` refresh cookie — is what a reload actually
 * relies on; `useSessionCheck` trades it for a fresh token at boot. A
 * `persist` middleware here would keep this app signed in past a token a
 * server-side sign-out or refresh failure already invalidated.
 */
export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
  logout: () => set({ token: null }),
}));
