import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError, createAuthMiddleware } from "better-auth/api";

import { env } from "~/env";
import { checkEmailAllowed } from "./allowed-emails";
import { client, db } from "./mongodb";

/**
 * Better Auth instance configured with MongoDB adapter and email/password + Google OAuth providers.
 * Includes hooks to validate email addresses against the allowed_emails collection.
 *
 * Features:
 * - Email/password authentication
 * - Google OAuth (if credentials are provided)
 * - Email whitelist validation for both sign-in methods
 *
 * @example
 * ```ts
 * const session = await auth.api.getSession({ headers });
 * ```
 */
export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            getUserInfo: async (token) => {
              const response = await fetch(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                {
                  headers: {
                    Authorization: `Bearer ${token.accessToken}`,
                  },
                },
              );

              if (!response.ok) {
                throw new Error("Failed to fetch user info from Google");
              }

              const profile = await response.json();

              // Validate email is allowed before proceeding
              if (profile.email) {
                const isAllowed = await checkEmailAllowed(profile.email);

                if (!isAllowed) {
                  throw new APIError("UNAUTHORIZED", {
                    message: "Email is not authorized to sign in",
                  });
                }
              }

              return {
                user: {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  image: profile.picture,
                  emailVerified: profile.verified_email ?? false,
                },
                data: profile,
              };
            },
          },
        }
      : {}),
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Validate email is in allowed_emails for email/password sign-in
      if (ctx.path === "/sign-in/email") {
        const email = ctx.body?.email as string | undefined;

        if (!email) {
          return;
        }

        const isAllowed = await checkEmailAllowed(email);

        if (!isAllowed) {
          throw new APIError("UNAUTHORIZED", {
            message: "Email is not authorized to sign in",
          });
        }
      }
    }),
  },
});
