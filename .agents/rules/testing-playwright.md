---
title: Playwright E2E — `.e2e.ts` Flows, Automatic in CI, Never a Merge Gate
impact: MEDIUM
impactDescription: E2E covers what jsdom cannot, without a real browser's flakiness blocking merges
tags: testing, playwright, e2e, ci
---

## Playwright E2E — `.e2e.ts` Flows, Automatic in CI, Never a Merge Gate

**Impact: MEDIUM**

Playwright covers what a jsdom component test structurally cannot: real navigation, the built output
with its env config baked in at build time (the `PUBLIC_*` / `NEXT_PUBLIC_*` values each app's
`~/env.ts` validates), and CSS that actually laid out. Everything else belongs in Vitest, which is an
order of magnitude faster.

| Concern | Belongs in |
|---|---|
| A component's branches, props, empty/error states | Vitest + RTL |
| A hook's key/`enabled`/`select` wiring | Vitest + RTL |
| A full flow across routes (sign in → land on home) | Playwright |
| The production build boots at all; the baked env config resolves | Playwright |
| What the **server** sent before any JS ran (Next Runtime) | Playwright |
| Anything needing real layout, a real file download, or multiple tabs | Playwright |

## Layout and commands

Specs live in `apps/<app>/e2e/` with the **`.e2e.ts`** suffix — a sibling of `test/`, not a subtree of
it. Vitest only collects `test/**/*.{test,spec}.{ts,tsx}`, so the two runners never see each other's
files even though both trees sit at the app root — and Playwright's
default glob does not match `.e2e.ts`, which is why `testMatch` is set explicitly in
[`playwright.config.ts`](../../apps/_template_vite/playwright.config.ts).

```bash
bun run e2e                                            # every app, through Turbo
bun run --filter @monorepo/_template_vite e2e          # headless, one app, all specs
bun run e2e:headed:template-vite                       # one real browser window, runs itself end to end
bun run --filter @monorepo/_template_vite e2e e2e/home.e2e.ts   # one file
bun run --filter @monorepo/_template_vite e2e --ui     # any flag forwards through `bun run --filter`
```

There is one `e2e:headed:<app>` script per Template app (`…:template-vite`, `…:template-next`) rather
than one root script, because the watched run is a single window over a single app's specs.

On a **Windows** dev box, invoke the runner as `bunx playwright test` from the app directory instead
— see "Running it locally on Windows" below for why.

The config's `webServer` builds and serves the app for you — never start a dev server by hand first,
and never point `baseURL` at a deployed environment.

There are **two projects over the same spec tree**, and every script names one explicitly because a
bare `playwright test` would run the specs once per project:

| Project | Used by | Difference |
|---|---|---|
| `chromium` | CI and `bun run e2e` | a fresh browser context per test — the isolation Playwright guarantees |
| `watch` | `bun run e2e:headed:<app>` only | `reuseContext` (one window for the whole run) + `slowMo: 500` + `timeout: 0` |

`watch` exists purely to be watched, and it trades away isolation to do it — `reuseContext` is
experimental and its reset between tests is best-effort. Never point CI at it, and never treat a
`watch` pass as evidence: a spec that only passes there is leaning on state a `chromium` run wipes.

Both configs also pin `locale: "vi-VN"`, because Chromium defaults to `en-US` and the language is
detected from the browser — `navigator.language` for i18next in the Vite Runtime, `Accept-Language`
for next-intl in the Next one. Without the pin, an assertion on user-visible text would resolve to
English here and Vietnamese in a component test, so E2E assertions use the same Vietnamese strings
the Vitest ones do.

## The Next Runtime runs the same harness against a real server

`_template_next`'s `webServer` builds and then runs the app's own `start` script — **`next start`**
rather than `vite preview` — on that app's own E2E port (3101, declared in
`apps/_template_next/ports.env` and forced onto the server through `webServer.env.PORT`). Every app
declares one dev port and one E2E port a hundred above it, so a leftover dev server can never answer
these specs from a stale module graph. That makes E2E the only place
server-only behaviour can be asserted at all, and the specs there use Playwright's `request` fixture
to fetch the document **raw** — no browser, no hydration — so anything asserted off it demonstrably
came from the server: content and `<title>` present before JS, `lang` on the html element, a real 404
status (see [[next-data-fetching]]).

The `request` fixture does **not** inherit the project's `locale`, so those specs send
`Accept-Language` themselves — next-intl negotiates from the header, and without it the raw document
comes back in the wrong language while the browser-driven specs beside it look fine.

## CI: automatic, non-blocking while it soaks

The `e2e` job in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) runs in the Playwright
container (`mcr.microsoft.com/playwright:v1.62.1-noble` — the plain Ubuntu runner the four Gate jobs
use ships no browser binaries), and covers **both** Template apps in one job, one step each.

It carries `continue-on-error: true` while the suite proves it is not flaky, so it reports without
blocking. Deleting that one line makes E2E a real merge gate. Because the job always reports green,
the uploaded report is the only place a failure is visible — which is why the upload step runs
`if: always()`.

Three constraints the job depends on, each of which silently breaks it when changed alone:

- **The image tag must match the installed `@playwright/test` exactly** (`1.62.1`) — the image bakes
  in the browser revision that version expects. The `testing` catalog entry is pinned without a caret
  for this reason; bump the tag and the catalog entry together, never one alone.
- **Do not route the job through Turborepo.** `turbo run` filters the environment in strict mode, and
  the Playwright image passes its browser location in `PLAYWRIGHT_BROWSERS_PATH`. Turbo swallowing it
  is what makes the job fail with `Executable doesn't exist` while the browsers sit installed on disk.
  The job calls `bun run --filter @monorepo/_template_vite e2e` (and the `_template_next` twin)
  directly. The root `bun run e2e` **is** `turbo run e2e` — that is fine locally, where the browsers
  are in Playwright's own default location and nothing has to be passed through.
- **The path filter is a separate `changes` job, not `on.push.paths`.** The four Gate jobs are
  required checks and must run on every push, so the trigger cannot be narrowed; a plain
  `git diff --name-only` in its own job decides whether E2E runs, matching
  `apps/`, `packages/`, `tooling/`, `bun.lock` and the workflow file itself. A brand-new branch (or a
  `workflow_dispatch`, which has no base commit) counts as touched rather than silently skipping E2E
  on a branch's first push.

## Running it locally on Windows

Invoke Playwright through **`bunx playwright test`**, from the app directory, rather than letting Bun
execute the runner: launching Chromium out of a `bun run` script hangs on Windows, and `bunx` puts the
run back under Node. Each app owns its `playwright.config.ts`, so the app directory is the cwd the
config resolves against.

```bash
bunx playwright test --project=chromium              # from apps/_template_vite
bunx playwright test e2e/home.e2e.ts                 # one file
```

On CI (Linux) the `bun run --filter … e2e` form in the workflow is the one that runs, and it is the
form to copy when adding a step.

## Assert on user-visible state, and let Playwright wait

Playwright's `expect` auto-retries until the timeout. Explicit sleeps defeat that and are the main
source of flakiness.

**Incorrect (manual waits, brittle selectors):**

```ts
// ❌ a fixed sleep is a race in disguise, and .btn-primary breaks on a restyle
await page.waitForTimeout(2000);
await page.click(".btn-primary");
expect(await page.locator("h1").textContent()).toBe("Trang chủ");
```

**Correct (role-based locators, web-first assertions):**

```ts
// ✅ each assertion retries until the condition holds or the timeout fires
await page.goto("/");
await page.getByRole("button", { name: "Đăng nhập" }).click();
await expect(page.getByRole("heading", { name: "Trang chủ" })).toBeVisible();
```

Route with the `ROUTES` constants rather than literal paths, exactly as the app does (see
[[routing-constants]]) — a spec imports the app's own table (`import { ROUTES } from
"../src/constants/routes"`), so a renamed route fails to compile instead of silently 404-ing at
runtime. The one honest exception is a spec whose subject *is* the URL a visitor types — a raw
document fetch, or a locale prefix being asserted — where the literal is the assertion.

## Keep specs independent

Under the `chromium` project each test gets a fresh browser context, so nothing carries over unless
you make it. Never write a spec that depends on one earlier in the file — `fullyParallel` is on and
the order is not guaranteed. Share setup through a fixture or `beforeEach`, and seed an authenticated
session rather than clicking through the login form in every spec: `signIn(page)` from
`e2e/support/auth-session.ts` writes the token the auth store persists, via `page.addInitScript`, so
it lands before the app boots.

Reach for `signIn(page)` rather than `test.use({ storageState })`, which is the more familiar
spelling of the same idea. `storageState` is a **context** option, and changing it part-way through a
run forces Playwright to build a fresh context — which is exactly what the `watch` project exists to
avoid, so it would put the signed-in specs in a second window.

## Conventions

- `apps/<app>/e2e/<flow>.e2e.ts`; one `test.describe` per flow.
- Locators: `getByRole` / `getByLabel` / `getByText`. A `data-testid` is a last resort for something
  with no accessible handle — never a CSS class or an nth-child chain.
- Assertions: `await expect(locator).toBeVisible()`. Never `waitForTimeout`.
- `forbidOnly` is on in CI, so a committed `test.only` fails the job instead of silently skipping the
  rest — do not work around it.
- Failures upload `playwright-report/` as a CI artifact; read the trace there before re-running.

Reference: [Playwright — Best Practices](https://playwright.dev/docs/best-practices), [`apps/_template_vite/playwright.config.ts`](../../apps/_template_vite/playwright.config.ts)
