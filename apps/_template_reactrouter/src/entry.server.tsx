import { PassThrough } from "node:stream";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import type { EntryContext, RouterContextProvider } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { ServerRouter } from "react-router";

import { createRequestI18n } from "@monorepo/i18n/i18next/create-request-i18n";

import { languageContext } from "~/libs/language-context";
// Side-effect import: initializes the i18next singleton this file clones from,
// and installs the i18n↔dayjs bridge. Both are per process on the server, which
// is exactly why the clone below exists — see `~/libs/i18n`.
import "~/libs/dayjs";

/**
 * This file is `react-router reveal`'s default plus the i18n wiring. Two edits
 * against the generated version: the import order is Biome's, and the render is
 * wrapped in a per-request i18next instance.
 */
export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: RouterContextProvider,
) {
  // https://httpwg.org/specs/rfc9110.html#HEAD
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  }

  /*
   * `loadContext` is the very `RouterContextProvider` root's `middleware` wrote
   * the negotiated language into: `@react-router/serve` supplies no
   * `getLoadContext`, but the server runtime creates one per request when none
   * is given and threads that same object through the middleware chain, the
   * loaders and into this function.
   *
   * The clone is not an optimisation, it is the correctness requirement. One
   * Node process renders every visitor at once, so switching the language of
   * the shared singleton is a race with no lock whose symptom is a page
   * correctly rendered in someone else's language — invisible under any load a
   * developer produces by hand, which is why `test/entry.server.test.ts` reads
   * this file as text and fails if that call ever appears here.
   * `createRequestI18n` shares the resource store and the ICU formatter, so a
   * clone costs an object per request rather than a re-read of the catalogue.
   */
  const requestI18n = createRequestI18n(loadContext.get(languageContext));

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");

    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";

    // Abort the rendering stream after the `streamTimeout` so it has time to
    // flush down the rejected boundaries
    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => abort(),
      streamTimeout + 1000,
    );

    const { pipe, abort } = renderToPipeableStream(
      // The provider sits OUTSIDE `<ServerRouter>` so it covers `root.tsx`'s
      // `Layout` and its `ErrorBoundary` too — every `useTranslation()` below
      // resolves to this request's instance rather than to the module global.
      <I18nextProvider i18n={requestI18n}>
        <ServerRouter context={routerContext} url={request.url} />
      </I18nextProvider>,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              // Clear the timeout to prevent retaining the closure and memory leak
              clearTimeout(timeoutId);
              timeoutId = undefined;
              callback();
            },
          });
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          pipe(body);

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );
  });
}
