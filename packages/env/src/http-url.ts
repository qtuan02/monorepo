// Namespace import, not `import { z }`: a bundler that externalizes zod for
// SSR on musl/Linux (CI) drops zod's `export { z }` namespace re-export, so `z`
// resolves to undefined and `z.url` throws at module load — a failure that
// never reproduces on the Windows dev box.
import * as z from "zod";

/**
 * An `http(s)` URL — the only shape a base domain can take.
 *
 * `protocol` is what makes this strict enough to be worth having: a bare
 * `z.url()` accepts a scheme-less "localhost:8000", parsing it as the scheme
 * "localhost:". `z.httpUrl()` is the built-in that pins http/https, but it
 * also demands a public domain, so it rejects http://localhost:3000 — which is
 * the real local config.
 *
 * Runtime-independent on purpose: it sits outside every Flavor because all
 * three base schemas build on it, and so does an app adding a URL of its own.
 */
export const httpUrlSchema = z.url({ protocol: /^https?$/ });
