# Knowledge Base — Project-Specific Facts & Gotchas

Facts about this codebase that are not obvious from reading a single file, and that cost someone
time to establish. For coding conventions see [`rules/`](rules/); for structure and data flow see
[`../CLAUDE.md`](../CLAUDE.md); for commands see [`commands.md`](commands.md).

Everything here was verified against this repo. When one of these stops being true, edit the entry
rather than adding a second one beside it.

## The two Runtimes, and what "Flavor" buys

An app has exactly one **Runtime** — **Vite client** (SPA behind nginx) or **Next.js** (App Router,
Node standalone). The Runtime decides which Template app it was cloned from and which **Flavor** of
the Runtime-dependent packages it uses. Two packages have Flavors; the rest have none.

| Package             | Flavors                                     | Shared, outside every Flavor            |
| ------------------- | ------------------------------------------- | --------------------------------------- |
| `@monorepo/env`     | `./vite/*` (`createEnv`), `./next/*` (t3-env) | `@monorepo/env/http-url`                |
| `@monorepo/i18n`    | `./i18next/*` (Vite), `./next-intl/*` (Next) | `languages.ts` + `locales/<code>.json`  |
| `@monorepo/sentry`  | Next only — there is no Vite Flavor         | —                                       |
| `api` `dayjs` `hook` `types` `ui` | none — Runtime-agnostic       | everything                              |

The point of a Flavor is that the **shared half stays one thing**. A language added to
`languages.ts` reaches both Runtimes; a message edited in `locales/vi.json` reaches both. If you
find yourself about to duplicate something into both Flavors, it belongs in the shared half instead.

## Environment (`.env` at the root, build-per-env)

There is **one `.env`**, at the repo root, gitignored, copied from the committed `.env.example`. Two
prefixes live in it, and each Runtime reads its own natively (ADR-0003) — there is no adapter layer
translating between them, deliberately.

1. **Vite Flavor** — `createEnv(schema, import.meta.env)` with the `PUBLIC_` prefix, the same shape
   as the reference monorepo. `vite.config.ts` sets `envDir: "../../"` and `envPrefix: "PUBLIC_"`,
   so Vite bakes every `PUBLIC_*` key into the bundle **at build time**. Nothing is injected at
   runtime.
2. **Next Flavor** — `@t3-oss/env-nextjs` with the `NEXT_PUBLIC_` prefix and a real `server` /
   `client` / `shared` split. Server-only variables carry **no prefix at all** — Next reads
   `process.env` directly for those.
3. **`clientRuntimeEnv` values must be written as literals.** Next inlines
   `process.env.NEXT_PUBLIC_FOO` by matching the *source text*; a computed or spread lookup is not
   rewritten, so it reads `undefined` in the browser and t3-env throws at boot. This is why that
   block in `env.ts` looks repetitive — it has to be.
4. **The Next app loads `.env` through `dotenv-cli`.** Next only auto-loads a `.env` beside its own
   `package.json`, and this repo keeps one at the root instead. Every `next` invocation in
   `apps/_template_next/package.json` is prefixed `dotenv -e ../../.env --`; dropping it starts the
   app with no env and surfaces as a t3-env validation throw, not as a missing file.
5. **Docker is build-per-env.** The builder stage takes the `PUBLIC_*` / `NEXT_PUBLIC_*` values as
   build `ARG`s, writes them to `.env`, and validates by **importing the app's own `env.ts`** before
   the bundler runs. The check and the app therefore parse the same schema by construction, with
   nothing to keep in sync — and a bad value fails the image build rather than the container boot.
6. `turbo.json` declares both prefixes in `globalEnv` and `.env` in `globalDependencies`, so
   changing a value busts the Turbo cache instead of serving a stale build.

Known soft spot: the Next Flavor casts t3-env's factory
(`createT3Env as unknown as T3CreateEnv`), which hides a rename of any of t3-env's six option names
(`experimental__runtimeEnv`, `emptyStringAsUndefined`, `shared`, `isServer`, `onValidationError`,
`extends`) behind a green typecheck. Mitigation: the catalog pins `@t3-oss/env-nextjs` **exact** at
`0.13.11`, and 17 runtime tests cover both the server and client branches. Treat a version bump of
that package as a change that needs its tests actually run, not just typechecked.

## Internationalization — one ICU catalogue, two Flavors

`packages/i18n` holds **one** language registry and **one** set of message files; the Flavors are
just the two libraries reading them. Messages are **ICU MessageFormat**, which next-intl speaks
natively and i18next reads through `i18next-icu`.

- **Adding a language** is two edits, both in the package: append the code to `src/languages.ts` and
  add `src/locales/<code>.json`. Nothing in `apps/` changes. The `messages` map is typed
  `Record<LanguageCode, …>`, so the new code **fails to compile** until its JSON exists — verified
  by hand, it produces two errors. `LocaleMessages` is anchored to `typeof vi`, so a *missing key*
  in another language is a type error too.
- **Three catalogue invariants that no type can express**, each guarded by
  `test/locales/catalogue-invariants.test.ts`:
  - **No `{{name}}`.** That is i18next's own interpolation syntax, not ICU. It typechecks, it
    renders — as the literal text `{{name}}`.
  - **No rich-text tag** (`<b>`, `<link>`, …). This is the one construct the two Flavors genuinely
    disagree on: `i18next-icu` forces `ignoreTag: true` and renders `<b>x</b>` verbatim, while
    next-intl expects the caller to supply a matching React element and throws when they don't. A
    message carrying a tag cannot be correct in both Runtimes, so it is banned from the shared
    catalogue outright. Formatting that has to vary belongs in the component, around the message.
  - **Every language names the same ICU arguments.** A placeholder renamed in one language only
    still typechecks and still renders — wrongly, and only for the language nobody on the team
    reads.
- **The JSON has no `exports` entry.** It is reachable only through `languages.ts`, statically
  imported; `@monorepo/i18n` (root) and `@monorepo/i18n/locales/vi.json` deliberately do not
  resolve. Messages are bundled, not fetched.
- **`intl-messageformat` is a root-catalog entry because `i18next-icu` needs it.** It is declared a
  `peerDependency` (`>=10.3.3 <12.0.0`) with no `peerDependenciesMeta`, and is not bundled.
- **The Next app must declare `transpilePackages: ["@monorepo/i18n"]`** — the package ships `.ts`
  source, not a build. And `proxy.ts` must write its matcher as a **literal**; Next reads the
  matcher statically, so an imported constant is not seen.
- `next-intl` 4.14.x has **no `./proxy` entry** — the proxy factory imports `createMiddleware` from
  `next-intl/middleware`, which is the right module for a Next 16 `proxy.ts`.

## HTTP layer (`@monorepo/api`)

- `createHttpClient({ baseURL, timeout })` returns an `HttpClient` over axios. It registers one
  interceptor — on the **response**, failure path only — converting any axios error into an
  `HttpError`, so every rejection leaves the client as one type.
- `HttpError` carries `statusCode` plus `isUnauthorized()` / `isForbidden()` / `isClientError()` /
  `isServerError()`. A network failure or timeout has no response and surfaces as `statusCode: 0`.
- Service classes take an `HttpClient` in the constructor and return **unwrapped** `Promise<T>` —
  `request()` returns `response.data`. **There is no response envelope to strip.** The single wiring
  site is `apps/<app>/src/libs/http-client.ts`.
- `@monorepo/types` holds the types a service returns and the params it accepts. They live in the
  package rather than an app because `@monorepo/api` must import them and a package cannot reach
  into an app.
- `template-service` in both `api` and `types` is a **placeholder on purpose** — a worked example of
  the shape, with no domain behind it. Copy the shape, not the name. The type argument on
  `client.get<T>` is the entire point of the module: omit it and `T` infers `unknown`, which then
  flows through the hook and into the component.

## TanStack Query defaults

`~/libs/query-client.ts` (one per app, same content) sets `staleTime` 60s, `gcTime` 5min,
`placeholderData: keepPreviousData`, queries `retry: 1`, `refetchOnWindowFocus: false`, mutations
`retry: 0`. It also installs a **global `MutationCache.onError`** that toasts every failed mutation
exactly once. So a mutation hook or component must **not** re-toast; add a per-mutation `onError`
only for rollback or focus recovery.

Query keys come from `queryKeysFactory` in `~/libs/query-key-factory.ts`, which also exports the
caller-option wrappers (`UseQueryOptionsWrapper`, `UseMutationOptionsWrapper`,
`UseInfiniteQueryOptionsWrapper`). Those wrappers omit `queryKey`/`queryFn`/`mutationFn`, which is
what makes it impossible for caller options to override the hook's own wiring.

In the **Next** app, TanStack Query is for what happens *after* paint — filtering, paginating,
mutating, polling. What a crawler has to read comes from a cached server read instead
(`next-data-fetching.md`). One value never lives in both.

## UI primitives (`@monorepo/ui`)

- shadcn, style `base-vega`, on **Base UI** (`@base-ui/react`) — not Radix. Composition is the
  **`render` prop**, not `asChild`, which does not exist here; state is a **bare** data-attribute
  (`data-open`, `data-checked`), not Radix's `data-[state=open]`.
- **Orientation is the exception, and it is load-bearing.** Base UI writes
  `data-orientation="horizontal"`, a real value attribute, while the shadcn registry styles against
  `data-horizontal:` / `data-vertical:`. `tooling/tailwind/globals.css` declares two
  `@custom-variant`s to bridge them. Delete those two lines and ~50 Tailwind utilities compile to
  **nothing, with no error** — the slider track loses its height, the scrollbar its width. jsdom
  computes no layout, so no test can catch this; Storybook is the seam.
- **`ui-add`'s `hooks` alias points at `#hooks`, a directory that intentionally does not exist.**
  shadcn CLI 4.20.x validates every alias against the target package's `exports`, and
  `@monorepo/hook` is subpath-only, so pointing the alias there produces an alias the CLI can never
  match and it refuses to write anything. `#hooks` is a landing pad, not a home: the CLI drops a
  hook there, `scripts/guard-no-local-hooks.ts` fails the run, and the fix is to move it to
  `@monorepo/hook` and re-point the import. The end state matches the reference monorepo exactly;
  only the route there differs, and now it enforces itself.
- **`data-table` and `date-picker` are not registry items.** shadcn publishes them as composition
  guides and `/r/styles/base-vega/{data-table,date-picker}.json` 404s. Both files here are
  hand-composed; `ui-add` will not regenerate them.
- **`@radix-ui/*` is in `bun.lock` and that is fine** — 17 entries, all transitive through
  `cmdk@1.1.1`, which the `command` registry item requires. No workspace `package.json` declares one
  directly and no source file imports one. The invariant is "nothing declares it directly", not
  "the lockfile is clean".

## Dates (`@monorepo/dayjs`)

- One configured singleton. Plugins are extended at **module scope**, so ESM configures it once
  before any importer — there is no factory to remember to call. `timezone` must extend after `utc`.
- **No `tz.setDefault`.** Timestamps render on the device's clock, which keeps the package reusable.
  Pin explicitly (`.tz("Asia/Ho_Chi_Minh")`) where a screen must read the same everywhere. Never
  compare zone *names*: `dayjs.tz.guess()` returns whatever IANA name the host maps `+07` to, often
  `Asia/Bangkok`.
- **`dayjs.locale(code)` silently no-ops** for a locale that was never imported — it keeps the
  previous one and nothing warns. `setDayjsLocale` is registry-checked with a deliberate fallback,
  and matches on the language half so `"en-US"` still lands on `en`.
- **The package does not import `@monorepo/i18n`** — it keeps its own locale registry by value,
  which holds it at the foundation layer. The app bridges the two at `~/libs/dayjs.ts`.
- **The React Compiler memoizes straight through the global locale.** dayjs's active locale is
  global mutable state React cannot see, so a component rendering `dddd` / `MMMM` / `.fromNow()`
  keeps painting the **old** language after a switch even though it re-rendered. Pass the resolved
  language into `.locale()` so it becomes a real render input
  (`dates-locale-render-input.md`). Purely numeric formats are unaffected — which is exactly why
  this hides: a ticking clock self-heals within a second, so only a *static* timestamp shows it.

## Build & tooling facts

- **Biome 2.5.12 is the whole lint/format toolchain** — one root `biome.json`, no per-workspace
  config, no Turbo `lint`/`format` task. There is no ESLint and no Prettier anywhere.
  - It runs once from the root because the `types` domain does whole-project inference.
  - `formatter.indentStyle: "space"` — Biome defaults to **tab**; without it every file is rewritten.
  - `css.parser.tailwindDirectives: true` — otherwise the Tailwind v4 `@theme` blocks fail to parse.
  - Three domains are on repo-wide — `react` and `turborepo` (`recommended`) and `types` (`all`).
    The **`next` domain is not**: it is enabled in an override scoped to
    `apps/_template_next/**`, because its rules only make sense inside a Next app. Adding a second
    Next app means adding it to that override's `includes`, not turning the domain on globally.
  - **Override order matters**: overrides apply in sequence and the last wins, so the broad
    `apps/**` env rules come first and the `env.ts` / `*.config.*` exemption after. Reversed, the
    broad rule re-enables `noProcessEnv` on exactly the files that need it.
  - `legacy/` is excluded here, not in CI (ADR-0001).
- **The React Compiler lint rules do not exist here, and that is an accepted gap.**
  `eslint-plugin-react-hooks@7` enabled 17 rules; Biome's `react` domain covers 2. The other 15 are
  compiler-powered (`static-components`, `set-state-in-effect`, `purity`, …). The compiler *does*
  run in both Templates, so a purity violation now makes it silently bail out on that component with
  no lint signal. Two CRITICAL rules — `react-no-inline-components` and `react-effects-sync-only` —
  are review-time discipline only.
- **Tailwind class sorting is deliberately off.** Biome's `useSortedClasses` is nursery, reads no
  config, and knows only the default preset — so the theme tokens, `tailwind-scrollbar` and
  `tw-animate-css` are invisible to it, and its fix is *unsafe*. Enabling it would produce churn
  that is wrong. IntelliSense is unaffected; it comes from the VS Code extension.
- **TypeScript 7** (the native Go compiler), one version for the whole workspace. Base config:
  `strict`, `noUncheckedIndexedAccess`, `checkJs`, `module: Preserve`, `moduleResolution: Bundler`,
  `noEmit`. Biome never invokes `tsc` — its inference is native Rust — so the linter is
  TypeScript-version-agnostic.
- TS 6+ made `types` default to `[]` and started checking side-effect imports (`TS2882`), which is
  why the Vite app carries `src/vite-env.d.ts`: without it, `import "~/globals.css"` fails to
  compile.
- **Path aliases**: `~/*` is declared **only** in each app's tsconfig `paths`, and Vite picks it up
  through `resolve.tsconfigPaths`. `@monorepo/*` resolves through Bun workspaces plus each package's
  `exports` — it is **not** a tsconfig alias.
- **`.gitattributes` sets `* text=auto eol=lf`, and it is load-bearing on Windows.** `biome.json`
  pins `lineEnding: "lf"`; this machine has `core.autocrlf=true`. Without that line a fresh checkout
  hands Biome CRLF files and `bun run check` fails on line endings alone. It also keeps the
  `.claude` → `.agents` symlink hashing identically on Windows and Linux.
- **`#root { isolation: isolate }` in the Tailwind globals is Vite-only.** Next's App Router does
  not render into `#root`; the Next Template establishes the same stacking context in its own
  layout.

## Legacy (`legacy/`)

Six apps and two `-public` packages, outside `workspaces.packages` — not installed, not built, not
linted (ADR-0001). Each is frozen on the toolchain it had, and comes back into `apps/` through its
own migrate ticket. `legacy/README.md` carries the app → Runtime → target Template table.

Do not mine a legacy app for terminology, patterns, or "how we do X here": they describe the shape
this repo is deliberately moving away from. The pre-Skeleton state of `packages/{env,hook,ui,sentry}`
is readable at commit `7edc303` if a decision ever needs tracing.

## AI tooling

- `.claude` is a **git symlink** to `.agents` (mode `120000`), so one directory serves both the
  repo's own convention and Claude Code's lookup path. Clone with
  `git clone -c core.symlinks=true`; on Windows the symlink also needs Developer Mode enabled.
  Note that PowerShell 5.1's `New-Item -ItemType SymbolicLink` refuses even with Developer Mode on
  — `git`, `mklink`, and `ln -s` under Git Bash all work.
- **`AGENTS.md` is a symlink to `CLAUDE.md`,** and that is load-bearing rather than cosmetic.
  `npx gitnexus analyze` writes its block into *both* filenames; with two real files you get a
  45-line `AGENTS.md` containing the GitNexus block and nothing else, which reads to any agent that
  opens it as the project guide. Through the symlink the two writes land on one file. Verified: a
  second `analyze` leaves the symlink intact and `CLAUDE.md` with exactly one
  `gitnexus:start` marker. `--skip-agents-md` opts out of both if it ever needs to.
- `.mcp.json` registers Context7 and GitNexus at **project** scope with no credentials in it. A
  Context7 API key, if you have one, belongs in your user-level config, not in this file.
- Skills are **vendored** — real files under `.agents/skills/` — but they come from **two owners**,
  and only one of them is in the lock. The 25 installed by the `skills` CLI (23 from
  `mattpocock/skills`, 2 from `vercel-labs/agent-skills`) are pinned by source and content hash in
  `skills-lock.json`; re-sync those with the CLI rather than hand-editing one, or the hash drifts
  and `skills experimental_install` can no longer restore it. The six `gitnexus-*` skills have
  **no** lock entry: `npx gitnexus analyze` writes them, and `skills update` neither knows about nor
  restores them.
