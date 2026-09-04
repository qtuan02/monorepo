import { SIGN_IN_REDIRECT_PARAM } from "~/features/auth/guard/redirect-param";

interface RedirectToFieldProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * The hidden field carrying "where you were headed" into the sign-in action.
 *
 * It is its own component, and the page wraps it in `<Suspense>`, because
 * `searchParams` is runtime data: with `cacheComponents` on, awaiting it in the
 * page body would stop the whole sign-in screen from prerendering (and, in a
 * build, fail). Isolating it means the form is in the static shell and only this
 * one input streams in.
 */
export default async function RedirectToField({
  searchParams,
}: RedirectToFieldProps) {
  const params = await searchParams;
  const value = params[SIGN_IN_REDIRECT_PARAM];

  if (typeof value !== "string") return null;

  return <input type="hidden" name={SIGN_IN_REDIRECT_PARAM} value={value} />;
}
