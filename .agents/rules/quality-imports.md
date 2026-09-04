---
title: Import and Export Patterns
impact: MEDIUM
impactDescription: Wrong import style breaks the build; consistent exports keep call sites predictable
tags: imports, exports, modules, conventions
---

## Import and Export Patterns

**Impact: MEDIUM (Wrong import style breaks the build; consistent exports keep call sites predictable)**

Two internal path shapes, and no others: `~/*` → `./src/*` (a per-app tsconfig `paths` alias) for
anything inside the current app, and `@monorepo/<pkg>/<subpath>` for the workspace packages
(`@monorepo/ui`, `@monorepo/api`, `@monorepo/hook`, `@monorepo/types`, `@monorepo/env`,
`@monorepo/i18n`, `@monorepo/dayjs`, `@monorepo/sentry`). `@monorepo/*` resolves through Bun
workspaces + each package's `exports` field — it is **not** a tsconfig alias. There is no `@/*`
alias, and no deep relative chains (`../../../libs/...`). Both Runtimes spell `~/*` the same way,
so a slice moves between them without an import rewrite.

Every package is **subpath-only** — always name the file that holds the symbol. `@monorepo/dayjs` is
the one package with a root entry, because its root is the configured singleton (see
[[quality-avoid-barrel-imports]]).

## Match the actual export style

Before importing, check whether the module is default- or named-exported — mixing them up is a build
error. The conventions here:

| Kind | File | Export style | Example import |
|------|------|--------------|----------------|
| Page | `~/pages/<name>-page.tsx` | **default** | `import HomePage from "~/pages/home-page"` |
| Feature template | `~/features/<feat>/templates/<name>.template.tsx` | **default** | `import HomeTemplate from "~/features/home/templates/home.template"` |
| Route guard | `~/features/auth/provider/<name>-route.tsx` | **default** | `import ProtectedRoute from "~/features/auth/provider/protected-route"` |
| Feature component | `~/features/<feat>/components/<name>.tsx` | **default** | `import CardItem from "~/features/home/components/card-item"` |
| Shared exception screen | `~/components/exception/<name>.tsx` | **default** | `import NotFound from "~/components/exception/not-found"` |
| Shared composite | `~/components/<group>/<name>.tsx` | named | `import { PageHeader } from "~/components/page/page-header"` |
| UI primitive | `@monorepo/ui/components/<name>` | named (`Button`, `Input`, …) | `import { Button } from "@monorepo/ui/components/button"` |
| Service class | `@monorepo/api/<system>/<domain>-service.ts` | named `<System><Domain>Service` | `import { EmrPatientService } from "@monorepo/api/emr/patient-service"` |
| HTTP client | `@monorepo/api/client.ts` | named | `import { createHttpClient, HttpError } from "@monorepo/api/client"` |
| Domain type | `@monorepo/types/<domain>.ts` | named | `import type { EmrPatient } from "@monorepo/types/patient"` |
| Service singleton | `~/libs/http-client.ts` | named `<system><Domain>Service` | `import { emrPatientService } from "~/libs/http-client"` |
| Data hook | `~/hooks/api/<entity>.ts` | named | `import { useGetTemplates } from "~/hooks/api/template"` |
| Query keys | `~/hooks/api/<entity>.ts` | named `<entity>QueryKeys` | `import { templateQueryKeys } from "~/hooks/api/template"` |
| Language registry | `@monorepo/i18n/languages` | named | `import { languages, defaultLanguage } from "@monorepo/i18n/languages"` |
| Language switch | `@monorepo/i18n/change-language` | named | `import { changeLanguage } from "@monorepo/i18n/change-language"` |
| A package Flavor | `@monorepo/<pkg>/<runtime>/<file>` | named | `import { createEnv } from "@monorepo/env/vite/create-env"` |
| dayjs singleton | `@monorepo/dayjs` | **default** (the one root entry) | `import dayjs from "@monorepo/dayjs"` |
| Date format | `@monorepo/dayjs/formats` | named | `import { DATE_TIME_FORMAT } from "@monorepo/dayjs/formats"` |
| Store | `~/stores/use-<name>-store.ts` | named `use<Name>Store` | `import { useAuthStore } from "~/stores/use-auth-store"` |
| Constant | `~/constants/<name>.ts` | named | `import { ROUTES } from "~/constants/routes"` |
| Type | `~/features/<feat>/types/<name>.ts` | named | `import type { TemplateForm } from "~/features/home/types/template-form"` |

Rule of thumb: **components, pages, and templates are default-exported** (the render surface);
**hooks, services, stores, constants, and types are named.**

```typescript
// ✅ named imports for the primitives, hooks, and stores
import { Button } from "@monorepo/ui/components/button";
import { templateService } from "~/libs/http-client";
import { useAuthStore } from "~/stores/use-auth-store";

// ✅ default import for a page / template / component
import HomeTemplate from "~/features/home/templates/home.template";

// ❌ assuming a default where the module exports named
import Button from "@monorepo/ui/components/button";

// ❌ deep relative chain instead of the ~/ alias
import { queryClient } from "../../../libs/query-client";
```

Relative `./` imports are fine **within** a folder for tightly-coupled siblings (a template importing
its own `./components/card-item`). Reach past one folder and you should be back on `~/` or `@monorepo/`.
Never import through a folder barrel — see [[quality-avoid-barrel-imports]].

## `#` subpath imports — inside `@monorepo/ui` only

`packages/ui` additionally uses Node **subpath imports** for its own internals, declared in its
`package.json` `imports` field and mirrored by `components.json` aliases so the shadcn CLI emits them:

```jsonc
"imports": {
  "#components/*": "./src/components/*.tsx",
  "#hooks/*":      "./src/hooks/*.ts",
  "#utils/cn":     "./src/utils/cn.ts"
}
```

```tsx
// ✅ packages/ui/src/components/alert-dialog.tsx
import { Button } from "#components/button";
import { cn } from "#utils/cn";
```

The reason it is not "a third convention to avoid": every file a `shadcn add --overwrite` writes
already uses these specifiers, so the package stays byte-identical to upstream instead of needing a
hand-edit after each sync.

**`#hooks/*` is a landing pad, not a home — `src/hooks/` deliberately does not exist.** The shadcn
CLI validates every alias in `components.json` before it runs, and it cannot resolve one aimed at
`@monorepo/hook`, whose exports are subpath-only; an alias inside this package is the only shape that
lets `ui-add` run at all. A generic hook still belongs in `@monorepo/hook`, so `packages/ui` depends
on that package and imports from it like any other consumer (`sidebar.tsx` →
`@monorepo/hook/use-is-mobile`). When the CLI does drop a hook here, `bun run --filter @monorepo/ui
guard:no-local-hooks` — which `ui-add` runs on every invocation — fails and says to move it, rather
than letting a second copy sit inside the UI package.

The scope is exact: `#` specifiers appear **only inside `packages/ui/src`**. An app still imports
`@monorepo/ui/components/<name>`, and no other package declares an `imports` field. Do not mix — a file
under `packages/ui/src/components` that reaches a sibling with `./button` or `../utils/cn` is the odd
one out and drifts on the next sync.

## Static assets — an import, never a `public/` URL string

An image the UI renders lives in `apps/<app>/src/assets/<group>/<name>.<ext>` and is reached with an
**import**, exactly like a module:

```tsx
// ✅ apps/<app>/src/components/select/select-language.tsx
import vnFlag from "~/assets/icons/vn.svg";

<img src={vnFlag} alt="" />;
```

```tsx
// ❌ a URL string aimed at `public/` — nothing resolves this, so nothing checks it
<img src="/icons/vn.svg" alt="" />;
```

The two differ in what the bundler can see. An import is a **module specifier**: Vite resolves it at
build time, hashes the file, and hands back its final URL — so renaming or deleting the file is a
**build error**, and the URL is correct wherever the app is served from. A `public/` URL string is
just characters inside JS. Vite rewrites paths in the HTML entry and in CSS `url(...)`, but it never
rewrites a string literal in a `.ts`/`.tsx` file, so that path gets neither guarantee: a rename fails
as a **404 nobody sees until runtime**, and the leading `/` silently means "the root of the domain"
even when the app is served under a path prefix.

Small assets are inlined as a `data:` URI rather than emitted as a file (Vite's
`build.assetsInlineLimit`, 4 KB by default). That is a size decision the bundler makes on its own —
never write code that depends on which side of it a file falls.

`public/` keeps only what must be fetched by a **fixed, unhashed name** the bundler cannot rewrite:
`favicon.png`, `robots.txt`, a file a third party requests by an agreed URL. Everything else is an
import.

The Next Runtime reads the same rule with its own bundler: a static import under `~/assets/` is
resolved, hashed and checked at build time (and is what `next/image` wants handed to it), while
`public/` again keeps only the fixed names — `robots.txt`, and the conventional files the App Router
picks up by filename.

Webfonts are the same rule reached from the other side: a `@fontsource*` package `@import`ed from
`~/globals.css` — the bundler owns those URLs too (see [[quality-styling-tailwind]]).
