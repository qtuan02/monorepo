---
title: Avoid Barrel Imports
impact: MEDIUM
impactDescription: Improves tree-shaking and keeps the module graph honest
tags: imports, performance, bundling
---

## Avoid Barrel Imports

**Impact: MEDIUM (Barrels defeat tree-shaking and pull extra modules into the bundle)**

A barrel is an `index.ts` that re-exports many modules so callers can `import { A, B } from "./thing"`.
It drags every re-exported module into the graph even when you use one symbol, which hurts tree-shaking.
Import from the concrete source file instead.

Every workspace package makes this the only option by design: each `exports` map exposes **subpaths
only**, so a bare `@monorepo/ui` or `@monorepo/api` import does not even resolve.

**Incorrect (barrel import):**

```typescript
// ❌ no root export exists — this fails to resolve, and would pull the whole library if it did
import { Button, Input, Card } from "@monorepo/ui";
```

**Correct (one concrete path per symbol):**

```typescript
// ✅ import each primitive from its own file
import { Button } from "@monorepo/ui/components/button";
import { Input } from "@monorepo/ui/components/input";
import { Card } from "@monorepo/ui/components/card";
```

## Don't author barrels either

The other half of the rule: **do not create the barrel in the first place.** The most common offender is
a `types/index.ts` inside a feature slice that re-exports the folder. Give each symbol its own named file
and import it by that concrete path.

**Incorrect (a folder barrel + a folder import):**

```typescript
// ❌ ~/features/patient/types/index.ts — a re-export barrel
export type { PatientFilters } from "./patient-filters";
export type { PatientForm } from "./patient-form";

// ❌ imported through the folder — the path names nothing and drifts silently
import type { PatientForm } from "~/features/patient/types";
```

**Correct (a named source file, imported directly):**

```typescript
// ✅ ~/features/patient/types/patient-form.ts, imported by its concrete path
import type { PatientForm } from "~/features/patient/types/patient-form";
```

This repo authors **no** `index.ts`/`index.tsx` barrels **anywhere** — not in an app's `types/`,
`stores/`, `hooks/`, `components/` or `features/`, and not as a package's entry point either. Each
file is named for what it holds and imported by that path (see [[architecture-vertical-slices]] and
[[quality-imports]]).

## One convention across every package

The default `exports` map is a subpath glob onto `src/`, with no root entry:

```jsonc
// packages/{api,types,hook,sentry}/package.json
"exports": { "./*": "./src/*.ts" }
```

So a symbol is always imported by the concrete file that holds it:

```typescript
import { createHttpClient, HttpError } from "@monorepo/api/client";
import { TemplateService } from "@monorepo/api/template/template-service";
import type { Template } from "@monorepo/types/template";
import { useDebounce } from "@monorepo/hook/use-debounce";
import { withSentry } from "@monorepo/sentry/next-config";
```

Three packages read differently, and each divergence is deliberate:

- **`@monorepo/ui`** splits the glob per directory (`"./components/*": "./src/components/*.tsx"`,
  `"./utils/*": "./src/utils/*.ts"`) because its components are `.tsx` and its utils are `.ts` — one
  glob cannot cover both extensions. It is still subpath-only.
- **`@monorepo/env`** and **`@monorepo/i18n`** put each Flavor behind its own subpath prefix
  (`"./vite/*"` and `"./next/*"`; `"./i18next/*"` and `"./next-intl/*"`), with the Runtime-independent
  half — the language registry, `change-language` — outside every Flavor. Naming the Flavor in the
  import path is what stops a Next app from pulling the Vite one by accident, and it is still one
  concrete file per specifier:

  ```typescript
  import { createEnv } from "@monorepo/env/vite/create-env";     // the Vite Runtime
  import { baseClientSchema } from "@monorepo/env/next/schema";  // the Next Runtime
  import { createI18n } from "@monorepo/i18n/i18next/create-i18n";
  import { languages } from "@monorepo/i18n/languages";          // shared by both
  ```

- **`@monorepo/dayjs`** adds a root entry (`".": "./src/dayjs.ts"`) on top of the glob, because its
  root *is* the configured singleton — `import dayjs from "@monorepo/dayjs"` mirrors how dayjs itself
  is imported, and a subpath would read `@monorepo/dayjs/dayjs`. Everything else in that package is a
  subpath (`/formats`, `/set-locale`, `/locales`). This is the **only** root entry in the workspace.

A new package takes the plain `"./*": "./src/*.ts"` shape. Splitting it per Flavor needs a second
Runtime to serve; adding a root entry needs the same justification dayjs has — the root is one
singleton, not a re-export of many modules.
