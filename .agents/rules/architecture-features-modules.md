---
title: Framework-Agnostic Services vs Data Hooks
impact: HIGH
impactDescription: Keeps API logic portable and isolates TanStack Query to a single layer
tags: architecture, services, hooks, tanstack-query, data
---

## Framework-Agnostic Services vs Data Hooks

**Impact: HIGH**

The data layer is split in two so that raw API logic stays portable and React/TanStack Query
concerns live in exactly one place.

## `@monorepo/api` — framework-agnostic service classes

A service is a **class** in the `@monorepo/api` package. Its constructor takes an `HttpClient`, and
each method calls `this.client.get/post/put/patch/delete<T>()` and returns an **unwrapped
`Promise<T>`** — the typed response body, nothing more. It must **not** import React or
`@tanstack/react-query`. There is **no `~/services/` folder** inside an app — a service belongs to the
package, not to whichever app happened to need it first.

## Layout — the folder is the backend system, the file is the domain

```
packages/api/src/
├── client.ts
├── emr/
│   ├── auth-service.ts        → class EmrAuthService
│   └── patient-service.ts     → class EmrPatientService
└── his/
    ├── auth-service.ts        → class HisAuthService
    └── patient-service.ts     → class HisPatientService
```

The path is `src/<system>/<domain>-service.ts`: the folder names the **backend system** the class
talks to (`emr`, `his`, …), the file names the **domain** inside it (`auth`, `patient`, …). The class
is `<System><Domain>Service` and its singleton is `<system><Domain>Service`.

A workspace app commonly fronts more than one backend, and the same domain usually exists in several
of them with a different base path and a different payload shape. That is **two classes**, never one carrying
a `system` flag or a base-path argument:

```typescript
// ❌ one class, branching on which backend it is talking to — the caller now has to know
//    which fields come back for which system, which is exactly what the service should absorb
class PatientService {
  getPatient(id: string, system: "emr" | "his"): Promise<unknown> { /* ... */ }
}

// ✅ one class per (system, domain) — each names its own payload type
class EmrPatientService { getPatient(id: string): Promise<EmrPatient> { /* ... */ } }
class HisPatientService { getPatient(id: string): Promise<HisPatient> { /* ... */ } }
```

Every service is instantiated **once** as a singleton in
[`~/libs/http-client.ts`](../../apps/_template_vite/src/libs/http-client.ts):

```typescript
// ✅ packages/api/src/emr/patient-service.ts — plain HTTP over the payload type
import type { EmrPatient, EmrPatientListParams } from "@monorepo/types/patient";

export class EmrPatientService {
  constructor(private client: HttpClient) {}

  getPatients(params?: EmrPatientListParams): Promise<EmrPatient[]> {
    return this.client.get<EmrPatient[]>("/patients", { params });
  }
}

// ✅ apps/<app>/src/libs/http-client.ts — one singleton, wired to the app's HttpClient
export const emrPatientService = new EmrPatientService(httpClient);
```

> The in-repo [`packages/api/src/template/template-service.ts`](../../packages/api/src/template/template-service.ts)
> is a placeholder for **both** halves of that path — `template` is neither a real system nor a real
> domain. Copy its shape, not its name.

**The type argument on `get<T>` is the point of the module.** Omit it and `T` infers `unknown`,
which then flows through the hook (`useQuery<unknown, …>`) and into the component — a service that
names no payload type is worth less than no service at all.

## The one exception: a third-party API that exactly one app calls

`@monorepo/api` models **the backends this workspace owns** — the origin
`*_BASE_DOMAIN_API` names, reached through one `HttpClient` whose `baseURL` and auth come from the
app's `env`. A third-party API is a different animal: its own origin, its own credential in a
querystring or header, its own payload vocabulary, and — crucially — usually **one** consumer. Put it
in the package and every app in the workspace inherits a dependency it will never call, plus a service
whose `HttpClient` cannot be the app's own.

So when an integration is (a) third-party, (b) called by exactly one app, and (c) authenticated by a
key that app declares itself, it stays in that app's slice under `~/features/<feat>/server/` — a
plain function over `fetch`, not a service class:

```typescript
// ✅ apps/mcp-weather/src/features/weather/server/openweathermap.ts — a provider
//    with one consumer, its own origin, and its own key in the querystring
const url = new URL(`${OPENWEATHERMAP_BASE_URL}/${endpoint}`);
url.searchParams.set("appid", env.MCP_WEATHER_OPENWEATHERMAP_API_KEY);
```

All three conditions have to hold. The moment a **second** app needs the same provider, it moves to
`@monorepo/api` as a service class like any other — otherwise the two copies drift, which is the
failure this whole rule exists to prevent. And this is never a licence for the app's *own* backend to
be called with a bare `fetch` from a slice: that always goes through the package.

## Each endpoint declares its own params — there is no shared request bag

A method's params type is named for that endpoint (`EmrPatientListParams`), and lives beside the
entity in `@monorepo/types/<domain>.ts` — in the package, not an app's `~/types`, because
`@monorepo/api` must import it and a package cannot reach into an app. A param that is not on the
type cannot be sent by accident, and a caller reading the type learns exactly what the endpoint
accepts.

Types are filed by **domain**, not by system: one `@monorepo/types/patient.ts` holds `EmrPatient`,
`HisPatient` and their param types side by side. The system shows up in the type *name*, so a
shape that two backends genuinely share stays one type instead of being copied per folder.

```typescript
// ❌ a shapeless bag: the caller cannot tell what reaches the querystring, and
//    `{ query: { page: 1 } }` handed to axios serializes as ?query[page]=1, not ?page=1
getTemplates(params?: { payload?: unknown; query?: Record<string, unknown> }): Promise<Template[]>;

// ✅ named params — one endpoint, one type
getTemplates(params?: TemplateListParams): Promise<Template[]>;
```

## The client returns the raw body — there is no envelope

The web `HttpClient` ([`packages/api/src/client.ts`](../../packages/api/src/client.ts)) returns the
raw axios body (`response.data`). There is **no `BaseResponse<T>` / `.Data` / `Result` / `ErrorCode`
envelope** to strip. A service annotates the body type `T`, and a component reads `query.data`
directly.

```typescript
// ❌ there is no envelope on web — never annotate or read one
getTemplates(): Promise<BaseResponse<Template[]>> { /* ... */ }   // no BaseResponse
const rows = query.data.Data;                                    // no .Data / IResult / ErrorCode
```

`client.ts` exports no envelope type at all, so there is nothing to mistake for one.

## `~/hooks/api` — TanStack Query lives here, and only here

A hook (`~/hooks/api/<entity>.ts`) wraps a service singleton in `useQuery` / `useMutation`, keyed
with `queryKeysFactory` (see [[tanstack-key-factory]]). This is the **only** layer that imports
`@tanstack/react-query`.

When a domain is served by more than one system, the **key factory's entity name must carry the
system too** — `queryKeysFactory("emrPatient")`, not `queryKeysFactory("patient")`. Two backends
sharing one entity name share one cache entry, so an EMR list would be served to a HIS screen and
invalidating one would refetch the other.

```typescript
// ✅ src/hooks/api/template.ts — the only place @tanstack/react-query appears for this entity
import { useQuery } from "@tanstack/react-query";
import { templateService } from "~/libs/http-client";
import { queryKeysFactory, type UseQueryOptionsWrapper } from "~/libs/query-key-factory";

// The entity name is inferred from the argument — never restated as an explicit
// type argument (see [[tanstack-key-factory]]).
const templateQueryKeyFactory = queryKeysFactory("template");

export const templateQueryKeys = {
  ...templateQueryKeyFactory,
  getTemplates: (params?: TemplateListParams) =>
    templateQueryKeyFactory.list(params),
};

export function useGetTemplates(
  params?: TemplateListParams,
  options?: UseQueryOptionsWrapper<Template[]>,
) {
  return useQuery<Template[], Error>({
    queryKey: templateQueryKeys.getTemplates(params),
    queryFn: () => templateService.getTemplates(params),
    ...options,
  });
}
```

## Errors: `HttpError`, toasted by the global handler

The response interceptor normalizes every failure to an `HttpError` (`statusCode`, `message`,
`isUnauthorized()`, `isForbidden()`, `isClientError()`, `isServerError()`). Write failures are
surfaced by the **global `MutationCache.onError` toast** in `~/libs/query-client.ts` — services (and
the hooks that wrap them) still never toast or transform errors themselves:

```tsx
// ✅ the global MutationCache toasts the normalized HttpError — the hook just invalidates
const { mutate } = useMutation({
  mutationFn: templateService.create,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: templateKeys.all }),
});
```

The global handler uses `toast` from `@monorepo/ui/components/toast` and `HttpError` from
`@monorepo/api` (see [[tanstack-use-mutation]], [[tanstack-consume-mutation]]).

Keeping services free of React means they can be reused and unit-tested without a renderer. See
[[tanstack-key-factory]] for how the hooks are keyed.
