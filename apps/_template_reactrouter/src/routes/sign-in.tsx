import { href, redirect } from "react-router";

import { defaultLanguage } from "@monorepo/i18n/languages";

import type { Route } from "./+types/sign-in";
import { TEMPLATE_USER } from "~/features/auth/constants/template-user";
import { guestOnly } from "~/features/auth/middleware/guest-only";
import SignInTemplate from "~/features/auth/templates/sign-in.template";
import { SIGN_IN_REDIRECT_PARAM } from "~/features/auth/utils/redirect-param";
import { safeRedirectTo } from "~/features/auth/utils/safe-redirect-to";
import i18n from "~/libs/i18n";
import { commitSession, getSession } from "~/libs/session.server";

/**
 * A signed-in visitor has no business here. Middleware rather than a check in
 * the loader because it also runs before the `action`: a POST from a tab that
 * already holds a session is bounced instead of minting a second cookie.
 */
export const middleware: Route.MiddlewareFunction[] = [guestOnly];

/**
 * Where the visitor was headed, narrowed before it reaches the form. The
 * loader resolves it so the hidden field is in the server-rendered HTML — a
 * visitor with JavaScript off still lands back where they were going. It is
 * narrowed HERE as well as in the action, so what the form carries is already
 * a path on this origin rather than whatever the query string said.
 */
export function loader({ url }: Route.LoaderArgs) {
  return {
    redirectTo: safeRedirectTo(url.searchParams.get(SIGN_IN_REDIRECT_PARAM)),
  };
}

/**
 * Mints the session cookie the guard checks for. The form posts here with
 * `<Form method="post">`, so this runs for a plain HTML submission and a
 * hydrated one alike.
 *
 * There is no credential check: this Template has no auth backend, and
 * pretending otherwise would hide the one thing worth copying — that the
 * session is an `HttpOnly` cookie written by a route action, so no script can
 * read it and the app needs no auth store at all. Replace the two lines that
 * pick `TEMPLATE_USER` with a real service call and everything around them
 * stays as-is.
 *
 * `throw` rather than `return`: the redirect is the whole outcome, so the
 * action has no data for `actionData` and typegen reads it as such.
 */
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const session = await getSession(request.headers.get("Cookie"));
  session.set("user", TEMPLATE_USER);

  // Narrowed again on the way out, because the hidden field is still a form
  // value anyone can edit — the loader's check protects the honest path, this
  // one protects the header.
  throw redirect(
    safeRedirectTo(formData.get(SIGN_IN_REDIRECT_PARAM)) ?? href("/dashboard"),
    { headers: { "Set-Cookie": await commitSession(session) } },
  );
}

export function meta({ matches }: Route.MetaArgs) {
  const t = i18n.getFixedT(matches[0].loaderData?.language ?? defaultLanguage);

  return [{ title: `${t("auth.signIn.title")} — ${t("common.brand")}` }];
}

export default function SignInRoute({ loaderData }: Route.ComponentProps) {
  return <SignInTemplate redirectTo={loaderData.redirectTo} />;
}
