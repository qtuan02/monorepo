---
title: The .server Suffix Is a Build Contract, and Everything Else Is Compiled Into Both Graphs
impact: CRITICAL
impactDescription: One Vite build emits a client bundle and a server bundle from the same source, so a module the browser must never load compiles into it silently, and a module-scope `window` read crashes the render instead of the browser.
tags: react-router, ssr, server-modules, bundling, hydration, vitest, env
---

## The `.server` Suffix Is a Build Contract, and Everything Else Is Compiled Into Both Graphs

**Impact: CRITICAL (Applies to the React Router Runtime — `apps/_template_reactrouter` and clones. A Vite SPA app has one bundle and none of this applies; a Next app splits on `"use client"` instead, see [[next-server-vs-client-components]].)**

`react-router build` runs **one** Vite build into **two** bundles (`build/client` and `build/server`).
Apart from the two entry files, the `.server` modules and a route module's server-only exports,
anything client code reaches under `src/` is compiled into **both** graphs — so "may the browser load
this?" and "does this survive with no `window`?" are one question. Three mechanisms answer it:

| Mechanism | Guarantees | Failure when skipped |
|---|---|---|
| the **`.server`** file suffix | the build refuses to bundle the module into the client graph | the module compiles into the browser bundle and blows up there, not at build |
| no module-scope browser API in `~/libs` | the module evaluates in the server bundle | the render throws at module load — a 500, not a console warning |
| `null` until an effect runs, in a component | server HTML and first client render agree | a hydration mismatch, or a server crash |

## `.server` is checked by the build, and the name is the only thing it checks

**Incorrect (a component reaching for the session, and a server-only module named without the suffix):**

```tsx
// ❌ session-card.tsx renders the session, it never reads it — the real file takes `user:
//    SessionUser` as a loader prop. The build refuses a `.server` module in the client graph.
import { getSessionUser } from "~/libs/session.server";

// ❌ src/libs/session.ts — drop the suffix and the build has nothing to check, so the import
//    above COMPILES and this module is evaluated in the browser. The secret's VALUE still does
//    not ship (no `PUBLIC_` prefix to inline, and `runtimeEnv` guards the read); what ships is
//    the read path, and env-core's `onInvalidAccess` throws BY NAME in every visitor's browser.
export const { getSession, commitSession, destroySession } = createCookieSessionStorage({ /* … */ });
```

**Correct (imported only from a route module's server-only exports, or an auth middleware):**

```ts
// ✅ src/features/auth/middleware/require-session.ts — one of exactly four importers, with
//    `guest-only.ts` (`user-context.ts` is a context, not a guard — [[reactrouter-middleware-guards]])
//    and the `action`/`loader` halves of `routes/sign-in.tsx` and `sign-out.tsx` ([[reactrouter-route-modules]]).
import { getSessionUser } from "~/libs/session.server";
```

## `~/libs` is dual-graph, so nothing there may touch `window`

**Incorrect (a module-scope DOM read, and a browser value seeded during render):**

```tsx
// ❌ src/libs/analytics.ts — a `~/libs` module is evaluated in the server bundle too, because a
//    loader, an action or a middleware may import it. This crashes the render at module load.
const deviceId = window.localStorage.getItem("device-id");

// ❌ ported from the Vite Template. The first throws during the server render — no `window` — and
//    takes the response with it; the second is a guaranteed mismatch: React discards the subtree.
const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
const [now, setNow] = useState(() => Date.now());
```

**Correct (`footer-viewport-size.tsx` — a value that cannot be identical on both sides is not part of the first render):**

```tsx
// ✅ `null` until mounted, the first read moved inside the effect — `header-clock.tsx`'s shape
//    for the softer reason, and a real external-system sync either way ([[react-effects-sync-only]]).
export default function FooterViewportSize() {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
```

`src/env.ts` is the sharpest case: its one server key is read behind `typeof process === "undefined"
? undefined : process.env.…`, because Vite defines no `process` in a browser bundle and a bare read
throws `ReferenceError: process is not defined` at module load, before any validation runs (see [[reactrouter-i18n-env]]).

## Under Vitest the framework plugin is swapped out, not added to

**Incorrect (keeping `reactRouter()` under test, or running both plugins):**

```ts
// ❌ `reactRouter()` renders a route module into a whole HTML document and throws "can't detect
//    preamble" on what `createRoutesStub` hands it. Adding `@vitejs/plugin-react` BESIDE it is the
//    other wrong fix — the framework plugin already installs React Refresh, so files transform twice.
export default defineConfig({ plugins: [reactRouter(), babel({ presets: [reactCompilerPreset()] })] });
```

**Correct (`vite.config.ts` — the one fork in the file, merged by `vitest.config.ts`):**

```ts
const isVitest = process.env.VITEST === "true";
  plugins: [isVitest ? react() : reactRouter(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
```

`vitest.config.ts` does `mergeConfig(viteConfig, …)`, which keeps `~/*` and `envDir: "../../"` true
in tests. It also pins `TEMPLATE_REACTROUTER_SESSION_SECRET` in `test.env`: `src/env.ts` parses at
module load, every route module reaches it, and a bare `vitest run` has no dotenv-cli in front of it.

env-core decides which half of `~/env` you get from `typeof window`, so **under jsdom `~/env` is the
client half of itself** and the `server` block throws *by name* on access. That splits the suite in two:

```tsx
// ❌ a jsdom test importing a route module that reaches session.server, with no mock — it fails on
//    an env error at module load rather than on anything it asserts.
import SignInRoute, { action } from "~/routes/sign-in";

// ✅ test/routes/protected.test.tsx — mock the storage; the guard's own coverage lives on node
vi.mock("~/libs/session.server", () => ({ getSessionUser: vi.fn() }));
```

```ts
// ✅ test/libs/session.server.test.ts — the real storage needs the environment where reading the
//    `server` half is legal AND `crypto.subtle` exists, which jsdom lacks and React Router signs
//    cookies with. Same first line in `test/env.test.ts`.
// @vitest-environment node
```

## Conventions

- A module that must never reach the browser is `<name>.server.ts` in `~/libs`, imported only from a
  route module's `loader`/`action`/`middleware` or an auth middleware — never from a component.
- No `window`, `document`, `localStorage` or bare `process.env` at module scope anywhere else under
  `src/` — that includes every `~/libs` file and `src/env.ts`.
- A browser-only value in a component starts as `null` and is filled by an effect; there is no
  `mounted` flag, the first `setState` *is* the mount signal.
- `vite.config.ts` forks on `process.env.VITEST === "true"` and nothing else; never run
  `reactRouter()` and `@vitejs/plugin-react` together.
- A jsdom test whose subject reaches `~/libs/session.server` mocks it; a test of the real storage, or
  of the `server` half of `~/env`, carries `// @vitest-environment node` (see [[testing-coverage]]).
- `react-router build` does **not** evaluate `src/env.ts`, so `package.json` carries a `prebuild`
  that imports it under the same `.env`. The Dockerfile pins the matching runtime assumption with
  `RUN ! grep -qE '^import[^;]*"@monorepo/' …/build/server/index.js`, because Vite does not
  externalize a linked workspace dependency in an SSR build — the packages are compiled in as source.

Reference: [`apps/_template_reactrouter/src/libs/session.server.ts`](../../apps/_template_reactrouter/src/libs/session.server.ts), [`src/libs/http-client.ts`](../../apps/_template_reactrouter/src/libs/http-client.ts), [`src/env.ts`](../../apps/_template_reactrouter/src/env.ts), [`vite.config.ts`](../../apps/_template_reactrouter/vite.config.ts), [`vitest.config.ts`](../../apps/_template_reactrouter/vitest.config.ts), [`footer-viewport-size.tsx`](../../apps/_template_reactrouter/src/features/layout/components/footer/footer-viewport-size.tsx), [ADR-0005](../../docs/adr/0005-runtime-react-router-framework-mode.md), [ADR-0007](../../docs/adr/0007-ssr-auth-cookie-session-middleware.md), [React Router — Server-only modules](https://reactrouter.com/how-to/server-only-modules)
