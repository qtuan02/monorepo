# Knowledge Base — facts and gotchas no single file shows

Each entry is a fact about this repo that cost someone time to establish and that you cannot read off one
file. Conventions are in [`rules/`](rules/); structure in [`project-structure.md`](project-structure.md);
commands in [`commands.md`](commands.md).

Every entry was verified against this repo. When one stops being true, edit it — never add a second entry
beside it.

## Runtime and Flavor

An app has exactly one **Runtime**: Vite client (SPA on nginx), Next.js (App Router, Node standalone), or
React Router framework mode (one Vite build with a server bundle, served by `react-router-serve`). The
Runtime decides which Template app it was cloned from and which **Flavor** of each Runtime-dependent
package it uses.

| Package | Flavors | Shared half (outside every Flavor) |
|---|---|---|
| `@monorepo/env` | `./vite/*` · `./next/*` (t3-env) · `./react-router/*` (env-core) | `./http-url` |
| `@monorepo/i18n` | `./i18next/*` (Vite + React Router) · `./next-intl/*` (Next) | `./languages`, `locales/<code>.json`, `./change-language`, `./resolve-language` |
| `@monorepo/sentry` | Next only | — |
| `api` · `dayjs` · `hook` · `types` · `ui` | none | everything |

- Three env Flavors but two i18n Flavors is correct. React Router reads messages through i18next exactly as
  Vite does. It needs its own env Flavor because one Vite build produces server **and** client code, so it
  is the only Runtime with a `server` block beside a `PUBLIC_` client one (ADR-0006).
- A Flavor never imports another Flavor. The React Router env Flavor re-declares the three `PUBLIC_*` base
  keys; `packages/env/test/react-router/create-env.test.ts` holds the two key sets equal.
- The shared half is the point: add a language to `languages.ts` or edit `locales/vi.json` and every
  Runtime sees it. If you are about to duplicate something across Flavors, it belongs in the shared half.

## Environment

One `.env` at the repo root, gitignored, copied from `.env.example`. It holds two client prefix groups
(`PUBLIC_` for Vite + React Router, `NEXT_PUBLIC_` for Next) and an unprefixed server-only group. A value
both groups need is written twice; there is no mapping layer (ADR-0003). How each script loads the file is
in `commands.md` § dotenv-cli.

1. **Vite Flavor** — `createEnv(schema, import.meta.env)`, prefix `PUBLIC_`. `vite.config.ts` sets
   `envDir: "../../"` and `envPrefix: "PUBLIC_"`; Vite inlines every `PUBLIC_*` key at build time. Nothing
   is injected at runtime.
2. **Next Flavor** — `@t3-oss/env-nextjs`, prefix `NEXT_PUBLIC_`, a real `server` / `client` / `shared`
   split. Server keys carry no prefix and stay in `process.env`.
3. **React Router Flavor** — `@t3-oss/env-core`, `clientPrefix: "PUBLIC_"`, a prefix-less `server` block
   beside it. `src/env.ts` is evaluated in **both** graphs, which explains everything odd in that file:
   - `runtimeEnv` must be the **full** map. env-core reads only that object and never falls back to
     `process.env` per key (the Next Flavor's `experimental__runtimeEnv` does).
   - Client keys are literal `import.meta.env.PUBLIC_*` reads (same reason as item 4).
   - The server key is guarded `typeof process === "undefined" ? undefined : process.env.X`. Not
     `import.meta.env.SSR`: Vite folds that to `false` in the client build, but nothing substitutes it under
     a bare Bun run, so the `prebuild` and Dockerfile checks would drop the `process.env` branch and report
     the key missing every time.
4. **`clientRuntimeEnv` values are literals.** Next inlines `process.env.NEXT_PUBLIC_FOO` by matching the
   source text; a computed or spread lookup is not rewritten and reads `undefined` in the browser. That
   block in `env.ts` is repetitive because it has to be.
5. **`react-router build` does not evaluate `src/env.ts`** (`next build` does). A missing secret still
   builds green, so that app's `prebuild` imports the module under the root `.env`
   (`dotenv -e ../../.env -- bun -e "import './src/env.ts';"`) — the same import the Dockerfile makes.
6. **Docker is build-per-env.** The builder stage takes `ARG BUILD_ENV` (default `example`), copies
   `.env.<BUILD_ENV>` in as `.env`, and validates by importing the app's own `env.ts` before the bundler
   runs — so the check and the app parse the same schema, and a bad value fails the image build. The React
   Router image copies `.env` a second time into the runner: its server key is a live `process.env` read
   inside `build/server/index.js`, and `react-router-serve` reads no dotenv, so its `CMD` is
   `node --env-file-if-exists=/app/.env …` where the Next runner is just `node server.js`.
7. `turbo.json` lists both client prefixes in `globalEnv` and `.env` in `globalDependencies`, so a changed
   value busts the cache. Unprefixed server keys are **not** in `globalEnv`: a change in the file is hashed
   by `globalDependencies`, but a value passed straight through the environment is not.

Soft spot: both t3-env-backed Flavors cast the library's factory (`createT3Env as unknown as T3CreateEnv`),
which hides an option rename behind a green typecheck. Mitigation: the catalog pins `@t3-oss/env-nextjs` and
`@t3-oss/env-core` **exact** at `0.13.11`, and the package's 30 runtime tests (11 Next, 13 React Router, 6
Vite) cover both branches. Treat a bump of either as a change that needs those tests run, not just typechecked.

## Internationalization — one ICU catalogue, two Flavors

`packages/i18n` holds one language registry and one set of message files. Messages are **ICU
MessageFormat**: next-intl reads it natively, i18next through `i18next-icu`.

- **Adding a language** is two edits in the package: append the code to `src/languages.ts`, add
  `src/locales/<code>.json`. Nothing in `apps/` changes. `messages` is typed `Record<LanguageCode, …>`, so
  the new code fails to compile until its JSON exists; `LocaleMessages` is anchored to `typeof vi`, so a
  missing key in another language is a type error too.
- **Three catalogue invariants** no type can express, each guarded by
  `test/locales/catalogue-invariants.test.ts`:
  - No `{{name}}` — that is i18next syntax, not ICU. It typechecks and renders as the literal text.
  - No rich-text tag (`<b>`, `<link>`). `i18next-icu` forces `ignoreTag: true` and renders the tag verbatim;
    next-intl throws unless the caller supplies a matching element. No message can be right in both, so
    formatting that varies goes in the component, around the message.
  - Every language names the same ICU arguments. A renamed placeholder still typechecks and renders —
    wrongly, in the language nobody on the team reads.
- The JSON has no `exports` entry. It is reachable only through `languages.ts`; messages are bundled, never
  fetched.
- `intl-messageformat` is a root-catalog entry because `i18next-icu` declares it a peer
  (`>=10.3.3 <12.0.0`) and does not bundle it.
- **The i18next singleton also runs on a server** (React Router). There it is one module-scope object shared
  by every concurrent request, so `changeLanguage` on a server path is a race: whichever render wrote last
  decides the language both paint. `entry.server.tsx` clones per request instead (`createRequestI18n` →
  `cloneInstance({ lng, initAsync: false })`, which shares the resource store and ICU formatter). No runtime
  assertion catches the race, so `test/entry.server.test.ts` reads the entry as text and fails on the
  string `changeLanguage`.
- The Next app declares `transpilePackages: ["@monorepo/i18n"]` — the package ships `.ts` source. Its
  `proxy.ts` writes the matcher as a **literal**; Next reads it statically and ignores an imported constant.
  Neither Vite-built Runtime needs an equivalent: Vite compiles a linked workspace package in as source,
  which the React Router Dockerfile pins by failing if any `@monorepo/` import survives into
  `build/server/index.js`.
- `next-intl` 4.14.x has no `./proxy` entry; the proxy factory imports `createMiddleware` from
  `next-intl/middleware`, which is the right module for a Next 16 `proxy.ts`.

## HTTP layer (`@monorepo/api`)

- `createHttpClient({ baseURL, timeout })` returns an `HttpClient` over axios with one interceptor — on the
  response failure path — converting every axios error into an `HttpError`.
- `HttpError` carries `statusCode` plus `isUnauthorized()` / `isForbidden()` / `isClientError()` /
  `isServerError()`. A network failure or timeout has `statusCode: 0`.
- A service class takes an `HttpClient` in its constructor and returns the **raw body** as `Promise<T>` —
  there is no response envelope. Every service is instantiated once in `apps/<app>/src/libs/http-client.ts`.
- `@monorepo/types` holds what a service returns and the params it accepts, because `@monorepo/api` must
  import them and a package cannot reach into an app.
- `template-service` in both `api` and `types` is a placeholder — copy the shape, not the name. Always write
  the type argument on `client.get<T>`; without it `T` is `unknown` all the way into the component.
- **Refresh-token is opt-in** (ADR-0014, `packages/api/README.md`): `withCredentials?: boolean` and
  `onAuthError?: (error: HttpError) => Promise<string | null>`, which fires on a **401 or 403** from a
  request not yet retried. A resolved token retries once with a new `Authorization` header; `null` or a
  throw falls through to the normal throw + `onUnauthorized` path. Concurrent 401/403s dedupe into one
  in-flight `onAuthError` call. 403 counts as an auth error because that is `apps/chat`'s backend contract;
  a backend where 403 means something else just does not pass `onAuthError`. A caller that passes neither
  option sees no change.

## TanStack Query

- `~/libs/query-client.ts` (one per app, same defaults): `staleTime` 60s, `gcTime` 5min,
  `placeholderData: keepPreviousData`, queries `retry: 1`, `refetchOnWindowFocus: false`, mutations
  `retry: 0`, plus a global `MutationCache.onError` that toasts every failed mutation once. A hook or
  component never re-toasts; a per-mutation `onError` is for rollback or focus only.
- `~/libs/query-key-factory.ts` exports `queryKeysFactory` and the caller-option wrappers
  (`UseQueryOptionsWrapper`, `UseMutationOptionsWrapper`, `UseInfiniteQueryOptionsWrapper`), which omit
  `queryKey`/`queryFn`/`mutationFn` so caller options cannot override the hook's wiring.
- **How the client is held differs by Runtime.** The Vite Template exports a module singleton (a browser tab
  is one visitor). Both server Runtimes export a `getQueryClient()` factory: on a server the module is
  shared by every request, so a module-level client would serve one visitor's cache into the next visitor's
  HTML. Nothing fails at runtime when this is wrong; the symptom is data in someone else's page.
- In both server Runtimes, Query is for what happens **after** paint. What a crawler reads comes from a
  `"use cache"` read (Next, `next-data-fetching.md`) or a route `loader` (React Router,
  `reactrouter-loader-vs-query.md`). One value never lives in both.

## Error boundaries (`react-error-boundary`)

- A failure inside `queryFn` or a query's `select` never reaches an error boundary: with the default
  `throwOnError: false` (unchanged everywhere here) it becomes `isError: true` on the query. Only a throw
  during render (or in a `useMemo` after `data` exists) is a boundary's job. That is why `apps/chat`'s
  per-Island boundaries (`~/components/exception/island-boundary.tsx`, spec #251/#252) need no
  `QueryErrorResetBoundary`: a rejected query and a render throw get different UI.
- `withErrorBoundary` (the HOC) is built on `React.forwardRef` and trips `react-no-forwardref.md`. Compose
  with the `<ErrorBoundary>` component.

## UI primitives (`@monorepo/ui`)

- shadcn style `base-vega` on **Base UI**, not Radix. Composition is the `render` prop (`asChild` does not
  exist); state is a bare data-attribute (`data-open`, `data-checked`), not `data-[state=open]`.
- **Orientation is the exception, and it is load-bearing.** Base UI writes `data-orientation="horizontal"`
  (a value attribute) while the shadcn registry styles `data-horizontal:` / `data-vertical:`.
  `tooling/tailwind/globals.css` declares two `@custom-variant`s to bridge them. Delete those two lines and
  ~50 utilities compile to nothing with no error — the slider track loses its height, the scrollbar its
  width. jsdom computes no layout, so Storybook is the only seam that catches it.
- `ui-add`, the `#hooks` landing pad, and the hand-composed `data-table` / `date-picker`: see
  `commands.md` § UI primitives.
- `@radix-ui/*` in `bun.lock` is fine — 17 entries, all transitive through `cmdk@1.1.1` (needed by
  `command`). The invariant is "no workspace declares it directly", not "the lockfile is clean".

## Dates (`@monorepo/dayjs`)

- One configured singleton. Plugins extend at module scope, so ESM configures it once before any importer;
  there is no factory to call. `timezone` must extend after `utc`.
- No `tz.setDefault`: timestamps render on the device's clock. Pin explicitly (`.tz("Asia/Ho_Chi_Minh")`)
  where a screen must read the same everywhere. Never compare zone *names* — `dayjs.tz.guess()` returns
  whatever IANA name the host maps `+07` to, often `Asia/Bangkok`.
- `dayjs.locale(code)` silently no-ops for a locale never imported. `setDayjsLocale` checks the registry,
  falls back to the default, and matches on the language half so `"en-US"` lands on `en`.
- The package does not import `@monorepo/i18n` (keeps its own locale registry, stays at the foundation
  layer). The app bridges the two in `~/libs/dayjs.ts` — in the two i18next Runtimes; the Next Template does
  not depend on `@monorepo/dayjs` and formats through next-intl. In React Router that bridge is per
  **process**, not per request, so a server-rendered component threads the request's language into
  `.locale()` itself.
- **The React Compiler memoizes straight through the global locale.** A component rendering `dddd` /
  `MMMM` / `.fromNow()` keeps painting the old language after a switch. Pass the resolved language into
  `.locale()` (`dates-locale-render-input.md`). Numeric formats are unaffected, which is why this hides: a
  ticking clock self-heals, only a static timestamp shows it.

## Build & tooling

- **Biome 2.5.12 is the whole lint/format toolchain** — one root `biome.json`, no ESLint, no Prettier.
  - `formatter.indentStyle: "space"` (Biome defaults to tab).
  - `css.parser.tailwindDirectives: true`, or the Tailwind v4 `@theme` blocks fail to parse.
  - Domains on repo-wide: `react`, `turborepo` (recommended), `types` (all). The `next` domain is enabled
    only in an override scoped to `apps/_template_next/**`; a second Next app is added to that override's
    `includes`, not turned on globally.
  - Override order matters (last wins): the broad `apps/**` env rules come first, the `env.ts` /
    `*.config.*` exemption after. Reversed, `noProcessEnv` re-fires on exactly the files that need it.
- **The React Compiler lint rules do not exist here — an accepted gap.** `eslint-plugin-react-hooks@7`
  had 17 rules; Biome's `react` domain covers 2. The compiler runs in all three Templates, so a purity
  violation makes it silently bail on that component with no lint signal. `react-no-inline-components` and
  `react-effects-sync-only` are review-time discipline.
- **Tailwind class sorting is off.** Biome's `useSortedClasses` is nursery, reads no config, and knows only
  the default preset, so theme tokens, `tailwind-scrollbar` and `tw-animate-css` are invisible to it and its
  fix is unsafe. IntelliSense still sorts via the VS Code extension.
- **TypeScript 7** (native Go compiler), one version for the workspace. Base: `strict`,
  `noUncheckedIndexedAccess`, `checkJs`, `module: Preserve`, `moduleResolution: Bundler`, `noEmit`. Biome
  never calls `tsc`, so the linter is TS-version-agnostic.
- TS 6+ defaults `types` to `[]` and checks side-effect imports (`TS2882`). That is why the Vite app has
  `src/vite-env.d.ts` (without it `import "~/globals.css"` fails). The React Router app instead sets
  `"types": ["node", "vite/client"]` in its tsconfig and imports the stylesheet as `./globals.css?url`.
- **Path aliases**: `~/*` is declared only in each app's tsconfig `paths` (Vite picks it up through
  `resolve.tsconfigPaths`). `@monorepo/*` resolves through Bun workspaces plus each package's `exports` — not
  a tsconfig alias.
- **`.gitattributes` sets `* text=auto eol=lf`, load-bearing on Windows.** `biome.json` pins
  `lineEnding: "lf"` and this machine has `core.autocrlf=true`; without that line a fresh checkout fails
  `bun run check` on line endings alone. It also keeps the `.claude` → `.agents` symlink hashing the same on
  Windows and Linux.
- **`#root { isolation: isolate }` in the Tailwind globals only matches an element with that id.** The Vite
  app has a mount div; the Next Template puts `id="root"` on `<body>`; the React Router Template's `<body>`
  carries no id, so the stacking context Base UI's portaled popups expect is not established there.
- **Every Next app's `build` is `"cache": false`** (`_template_next`, `portfolio`, `mcp`). `next build` emits
  `.next/node_modules/<pkg>-<hash>` as absolute symlinks into `node_modules/.bun/…` (via `@sentry/nextjs`)
  whose targets overrun the 100-byte `linkname` field of Turbo's tar format, so the cache write always
  failed silently; the flag just says so. Dropping those paths from `outputs` restores caching and breaks the
  restored build (`Cannot find module`). Expect every Next build, local and CI, to run cold. The React Router
  `build` caches normally.

## Publishing to npm (`@fe-monorepo/*`)

Two packages leave this repo: `@fe-monorepo/ui` and `@fe-monorepo/hook` (ADR-0004). The commands are in
`commands.md` § Publish; these are the whys.

- **A Publish shell** is a workspace holding only a hand-written `package.json`, a consumer README and a
  gitignored `dist/`: `packages/ui-public`, `packages/hook-public`. The source packages cannot publish as
  they are (`catalog:` and `workspace:*` ranges, which `npm publish` resolves neither of), and flipping a
  source package off `private` would move every app in the workspace onto a build output. A shell declares
  no `typecheck` or `test`, so Turbo skips it in both graphs.
- `bun publish` strips those ranges but has no provenance and no OIDC yet
  ([oven-sh/bun#15601](https://github.com/oven-sh/bun/issues/15601),
  [#22423](https://github.com/oven-sh/bun/issues/22423)). Provenance won.
- **A shell's dependency ranges are copied exactly** from what the catalog resolves to — never caretted.
  Widening invents a version decision and hands consumers a minor the Gate never ran.
- **`@fe-monorepo/ui` inlines `useIsMobile`** instead of depending on `@fe-monorepo/hook` (one hook; a
  dependency would mean matching two independently-versioned shells by hand). rslib's `autoExternal` is
  bundle-mode only and bundleless externalizes every non-relative specifier, so `packages/ui/rslib.config.ts`
  compiles `use-is-mobile` + `use-media-query` into `dist/internal/` as a second `lib` (the same two files
  `tsconfig.hook.json` includes) and rewrites the import through `output.externals`. `resolve.alias` cannot
  do this — externalization runs first. `use-media-query` is Derived from hooks-ts, so the shell ships
  `LICENSE-hooks-ts` (ADR-0010).
- **That `../internal/` prefix is correct only because every output file sits one level under `dist/`.**
  `assertRelativeImportsResolve()` in `packages/ui/scripts/build.ts` walks every emitted `.js`/`.d.ts` and
  fails the build when a relative specifier does not land on a real file.
- **The `.d.ts` half needs the `#` aliases restated as `compilerOptions.paths`** in `tsconfig.build.json`.
  Rspack resolves the package's `imports` field; tsgo does not, so without `paths` every `.d.ts` ships
  `#components/button`, which no consumer resolves and nothing in the repo notices. The same file needs an
  explicit `rootDir` or TypeScript 7 fails with TS5011.
- **`typescript` is pinned `~7.0.2` for a publish reason.** `dts` is generated by tsgo; holding the minor is
  the only way a published `.d.ts` cannot change shape because of a 7.1.
- **`dist/globals.css` is a fragment, not a Tailwind entry.** `build.ts` inlines `theme.css` into the
  tailwind-config `globals.css` and drops exactly one line — `@import "tailwindcss";` — because `tailwindcss`
  is a peer. It throws if an upstream import line it replaces is gone, a `@custom-variant` went missing, or a
  `@monorepo/` string survived.
- **The shipped `globals.css` registers its own `@source "./";`**, because Tailwind v4 skips `node_modules`
  and resolves `@source` relative to the stylesheet. The consumer contract is two lines:

  ```css
  @import "tailwindcss";
  @import "@fe-monorepo/ui/globals.css";
  ```

  Before 2026-09-17 the consumer wrote a third `@source` line, and a misaimed path failed silently (build
  green, every utility compiled to nothing). `publish:smoke` therefore writes only the two lines and asserts
  on the **built** CSS (`.whitespace-nowrap`, `[data-orientation=vertical]`).
- `tw-animate-css` and `tailwind-scrollbar` are real `dependencies` of the ui shell (the CSS `@import`s /
  `@plugin`s them). Miss them and animations and scrollbars vanish silently.
- **There is no `NPM_TOKEN`.** `release.yml` uses npm trusted publishing: `id-token: write` mints an OIDC
  token npm exchanges for publish rights, with provenance. Two settings live outside the repo: the trusted
  publisher on npmjs.com, configured per package against this repo **and this workflow's file name**
  (renaming `release.yml` breaks publishing until the setting follows), and "Allow GitHub Actions to create
  and approve pull requests" under Settings → Actions → General (without it the run dies opening the
  "Version Packages" PR). Trusted publishing needs npm ≥ 11.5.1, which the job upgrades to.
- **npm names differ from workspace names on purpose**: `@fe-monorepo/ui` on npm, `@monorepo/ui` here.
  Nothing in the repo imports `@fe-monorepo/*`; the publish path sits entirely off the dev loop and
  `publish:smoke` is the only thing that exercises it.
- **`bun.lock` drifts after a release, accepted.** The "Version Packages" PR bumps the shells' `version`
  without touching the lockfile, and `bun install --frozen-lockfile` still installs clean against that
  mismatch. `--lockfile-only` would not refresh the field either.
- `any` in the published `.d.ts` is React's own (`React.JSXElementConstructor<any>` via
  `useRender.ComponentProps`) and not worth chasing.

## History

Everything that predates the Skeleton was migrated and deleted (ADR-0001). Two pointers remain useful:

- The frozen originals of `ui-public` / `hook-public` put `@fe-monorepo/ui` 1.0.2 and `@fe-monorepo/hook`
  1.0.0 on npm — where the current shells took their starting versions from.
- The pre-Skeleton `packages/{env,hook,ui,sentry}` are readable at commit `7edc303`.

Read those for history only, never for terminology or "how we do X".

## AI tooling

- `.claude` is a git symlink to `.agents` (mode `120000`). Clone with `git clone -c core.symlinks=true`; on
  Windows also enable Developer Mode. PowerShell 5.1's `New-Item -ItemType SymbolicLink` refuses even then —
  use `git`, `mklink`, or `ln -s` under Git Bash.
- **`AGENTS.md` is a symlink to `CLAUDE.md`, and that is load-bearing.** `npx gitnexus analyze` writes its
  block into both filenames; with two real files `AGENTS.md` becomes a 45-line file holding only the
  GitNexus block, which any agent opening it reads as the project guide. Through the symlink both writes
  land on one file (verified: a second `analyze` leaves one `gitnexus:start` marker). `--skip-agents-md`
  opts out.
- `.mcp.json` registers Context7 and GitNexus at project scope with no credentials. A Context7 API key
  belongs in your user-level config.
- `.agents/settings.json`: `plansDirectory` (plan-mode scratch lands in `.agents/plans/`), the `ponytail`
  plugin, and the two enabled MCP servers.
- Skills are vendored from three owners, and only one owner is in `skills-lock.json` — see
  `workflow.md` § Skills.
