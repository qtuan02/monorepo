---
title: Respect the Layered Import Direction
impact: CRITICAL
impactDescription: Prevents circular imports, keeps the dependency graph acyclic, and keeps lower layers portable
tags: architecture, dependencies, imports, layering, circular
---

## Respect the Layered Import Direction

**Impact: CRITICAL**

The app under `src/` is organized in layers, and imports must always point **downward** — a higher
layer may import a lower one, never the reverse. Upward or circular imports cause bundler errors,
fragile module-init order, and untestable low-level code.

From lowest to highest:

```
~/types  ~/constants  ~/utils              (foundation — no app-domain deps)
  ↓
@monorepo/api  @monorepo/i18n  @monorepo/dayjs  (services; i18n registry + createI18n; configured dayjs)
  ↓
~/libs/http-client  ~/libs/i18n  ~/libs/dayjs  (wiring sites — instantiate/bridge the singletons)
  ↓
~/hooks/api   ~/stores                     (TanStack Query hooks, Zustand stores)
  ↓
~/components                               (@monorepo/ui primitives + shared composites)
  ↓
~/features/<domain>                        (templates + components for a domain)
  ↓
~/pages                                    (the route tree — the top. `src/app` in the Next Runtime;
                                            `src/routes` + `src/routes.ts` in the React Router one)
```

> **The Next Runtime substitutes the top layer, and adds nothing below it.** In `_template_next`
> the top is `src/app/**` — App Router segments — where the Vite Runtime has `~/pages/`; every
> layer beneath and every arrow between them is identical. Two consequences worth stating, because
> both are ways the graph could be broken without noticing:
>
> - A Server Component, a cached loader under a slice's `server/`, or a Server Action may import
>   `~/libs/http-client` and `@monorepo/api` directly. That is still a downward import — the top
>   layer reaching the service layer — not a bypass. What it may **not** do is point the other way:
>   a `~/libs`, `~/hooks` or `~/features` module may never import from `src/app` (see
>   [[next-data-fetching]]).
> - A slice's `guard/` sits at the same height as the Vite Runtime's `provider/`: it is exposed
>   **upward** to `src/proxy.ts` and imports downward from `~/libs` (see [[next-proxy-guards]]).

> **The React Router Runtime substitutes the same top layer, and reads identically.** In
> `_template_reactrouter` the top is `src/routes/**`, declared in the route config `src/routes.ts`.
> The same two consequences hold, one file name at a time:
>
> - A route module's `loader` or `action` may import `~/libs` and `@monorepo/api` directly — the top
>   layer reaching the service layer, still downward, not a bypass. `src/routes/sign-in.tsx` imports
>   `~/libs/session.server` exactly this way. What it may **not** do is point back: no `~/libs`,
>   `~/hooks` or `~/features` module may import from `src/routes` (see [[reactrouter-loader-vs-query]],
>   [[reactrouter-server-modules]]).
> - A slice's `middleware/` sits at the same height as `provider/` and `guard/`: exposed **upward** to
>   `src/routes.ts`, importing downward from `~/libs` — `~/features/auth/middleware/require-session.ts`
>   imports `~/libs/session.server` and nothing above it (see [[reactrouter-middleware-guards]]).

**Rules:**

1. `~/types`, `~/constants`, `~/utils` must not import from `@monorepo/api`, `~/libs`, `~/hooks`,
   `~/stores`, `~/components`, `~/features`, or `~/pages`.
2. `@monorepo/api` service classes must not import React or `@tanstack/react-query` — that concern
   belongs in `~/hooks/api` (see [[architecture-features-modules]]).
3. `~/hooks/api` may import `~/libs/http-client`, `@monorepo/api`, `~/types` — but not `~/components`,
   `~/features`, or `~/pages`.
4. `~/features` and `~/pages` are the highest layers: pages render feature templates, never the
   reverse.
5. A package never imports another package that sits above it: `@monorepo/dayjs` keeps its own locale
   registry by value rather than importing `@monorepo/i18n`, and the app's `~/libs/dayjs` is what
   bridges the two (see [[dates-dayjs-singleton]]).

**Incorrect:**

```typescript
// ❌ a util reaching up into the data layer
// src/utils/format-token.ts
import { authService } from "~/libs/http-client";

// ❌ a service class importing TanStack Query (belongs in ~/hooks/api)
// packages/api/src/emr/auth-service.ts
import { useQuery } from "@tanstack/react-query";

// ❌ a foundation lib statically importing a store — creates a cycle
// src/libs/http-client.ts
import { useAuthStore } from "~/stores/use-auth-store";
```

**Correct:**

```typescript
// ✅ hook wraps the service singleton (downward import)
// src/hooks/api/auth.ts
import { useMutation } from "@tanstack/react-query";
import { authService } from "~/libs/http-client";
```

If a low layer truly needs a value from a higher one — e.g. the auth token inside the request
interceptor — read it **lazily at call time** through the store's imperative getter, never a
top-level import:

```typescript
// ✅ read the token lazily, so ~/libs stays below ~/stores in the graph
const token = useAuthStore.getState().token;
```

Keep the graph acyclic in code review and via the linter's import ordering. The service-vs-hook
split in [[architecture-features-modules]] falls directly out of this ordering.
