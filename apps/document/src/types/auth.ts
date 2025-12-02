import type { ReactNode } from "react";

import type { auth } from "~/libs/auth";

/**
 * Session type from Better Auth
 */
export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * Props for the AuthProvider component
 */
export interface AuthProviderProps {
  children: ReactNode;
  session: Session;
  pathname: string;
}

