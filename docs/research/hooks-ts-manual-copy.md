# Copy tay hook từ hooks-ts (michal-worwag) vào `@monorepo/hook` — khảo sát trước khi grill

> Ngày kiểm tra: **2026-09-17**, nhánh `dev`, HEAD `ea20143`. Nguồn: chỉ primary sources — source thật của **`michal-worwag/hooks-ts`** tải từ `raw.githubusercontent.com` **pin ở commit `9bd1243`** (`9bd12431bb24b84d211f0d735c6bef79fe1be85a`, HEAD của `main`, ngày 2025-01-13), GitHub API của repo đó, `npm view hooks-ts`, trang https://hooks-ts.com/ và https://hooks-ts.com/docs/intro, react.dev, và file thật trong repo này (đường dẫn kèm số dòng, `git show` kèm hash). Ba kiểm tra chạy thật trong scratchpad, không đụng repo: `tsc` của repo (TypeScript 7.0.2, `@types/react` 19.2.18, `tooling/typescript/base.json`), `biome lint`/`biome check` của repo (Biome 2.5.12), và **chạy 15 file test upstream dưới Vitest 5.0.0 + `@testing-library/react` 16.3.3 + React 19.2.8 + jsdom 30.0.1 của repo**. Mọi claim có citation; chỗ chưa verify được ghi rõ **"chưa xác minh"**.
>
> **Đây không phải `usehooks-ts` (juliencrn).** Note [`usehooks-ts-manual-copy.md`](./usehooks-ts-manual-copy.md) khảo sát nhầm thư viện; các fact **phía repo** trong đó (§5 so với 14 hook cũ, §6 cơ chế MIT, §7 rslib/`exports`/`documents`/`ui-public`) vẫn đúng và được dẫn lại ở đây bằng đường dẫn; mọi claim về **thư viện** trong note này đều lấy từ `michal-worwag/hooks-ts`.
>
> **Phạm vi:** chủ repo muốn copy tay source hook của hooks-ts vào `packages/hook/src/` (một file kebab-case một hook, không barrel, không depend npm package) để dựng lại `@monorepo/hook` — thứ được publish lên npm dưới tên `@fe-monorepo/hook` qua Publish shell `packages/hook-public` (ADR-0004). Note này trả lời *có gì, copy được gì, copy thế nào, giá của từng hook* — quyết định là của phiên grill sau. Không file nào ngoài note này được sửa.

## Tóm tắt kết luận

1. **hooks-ts 0.12.0 có đúng 18 hook, không phải 16** — `src/index.ts` export 18, site và README liệt kê 18, docs có 18 trang. MIT © 2024 Michał Worwąg, **không có dependency runtime nào** (chỉ `peerDependencies.react`), tổng **436 dòng** cho 18 file. Package là single-package trong monorepo pnpm (`packages/hooks-ts/`), build tsup ra một barrel `dist/index.js`. (§1, §2)
2. **Upstream gần như đứng yên**: commit cuối trên `main` 2025-01-13 (Dependabot), tag cuối `hooks-ts@0.12.0` 2025-01-05; 9 PR mở đều là Dependabot, 0 issue mở, 2 star, 0 fork. `pushed_at` 2025-12-01 là nhánh Dependabot. Có **một nhánh `refactor/change-structure` chưa merge (2025-09-21)** sửa đúng bốn hook SSR-hostile — `useDarkMode`, `useLocalStorage`, `useMediaQuery`, `useNetworkStatus` — trong đó có fix bug đảo dấu `isServer`. (§1, §4.3)
3. **11 trong 14 hook cũ của repo (`1c9eaa1^`) là bản copy gần nguyên văn của hooks-ts** — 0–5 dòng khác sau chuẩn hoá, toàn bộ là thứ tự import / `function` vs `const` / một dòng `console.log`. `use-network-status` cũ **trùng 0 dòng**, kể cả bug `const isServer = typeof window !== "undefined"` (`useNetworkStatus.ts:3`); `use-throttle` cũ trùng `useThrottle` upstream, mà body của `useThrottle` **giống hệt `useDebounce`** (không throttle gì). Note usehooks-ts đã đoán sai nguồn của ba hook này. Bản hiện tại: `use-debounce.ts` = `useDebounce` hooks-ts (2 dòng khác: thứ tự import), `use-isomorphic-layout-effect.ts` trùng 0 dòng với cả hai thư viện. (§5)
4. **Copy nguyên xi 18 file qua Gate của repo với chi phí gần bằng 0**: `tsc --noEmit` (TS 7, `@types/react` 19, `noUncheckedIndexedAccess`) **0 lỗi**, kể cả call site `useRef<HTMLDivElement>(null)` cho `useHover`/`useOnScreen` — upstream đã khai `RefObject<T | null>` từ 0.8.1. `biome lint`: 2 error (`useImportType`, FIXABLE) + 2 warning (`noUnusedVariables`); format 18/18 file lệch (nháy đơn, `check:fix` lo); sau `biome check --write` còn **0 error, 2 warning**, và `biome check` exit 0 khi chỉ có warning. (§4.2)
5. **15/18 hook có test, và cả 15 file (50 test) chạy xanh dưới Vitest 5 + RTL 16.3.3 + React 19.2.8 của repo** sau khi đổi đường import. Thiếu test: `useIsomorphicLayoutEffect`, `useMediaQuery`, `useOnScreen`. Nhưng hai test nói ít hơn tên: `useThrottle.test.ts:15-17` gán `result.current = 'test2'` thay vì rerender, và `useNetworkStatus.test.ts` chỉ assert `true`. (§7.5)
6. **Thứ cản không phải TypeScript mà là rule của repo**: `usePrevious` ghi hai ref **trong render** (`usePrevious.ts:18-21`, đúng thứ react.dev cấm và lint `refs` của React Compiler flag); `useDarkMode` + `useLocalStorage` + `useSessionStorage` đọc `localStorage`/`sessionStorage`/`matchMedia` trong `useState` initializer **không guard** — crash ngay khi render trên server (`packages/ui` chạy trong app Next và React Router); `useNetworkStatus` có bug đảo dấu; `useThrottle` không throttle; `useSlugify` không phải hook; `useMediaQuery` là bản "false rồi mới đúng" có flash. Nhóm sạch và có consumer tự nhiên: `useDebounce` (đã có), `useTimeout`, `useOnScreen`, `useHover`, `useToggle`/`useBoolean`/`useCounter`, `useCopyToClipboard`. (§4.1)
7. **Cơ chế copy của repo đã sẵn** (dẫn lại note usehooks-ts §7): `exports: "./*"` + rslib bundleless rewrite `./use-x` → `./use-x.js`; nhưng **mỗi file thêm vào `packages/hook/src/` là ba việc kèm**: bị `packages/ui/rslib.config.ts:63-69` vendor vào `ui-public/dist/internal/`, bị `apps/documents` sinh một trang docs, và **phải có `documents.hooks.items.<slug>.description` trong cả `vi.json` lẫn `en.json`** — `catalogue-invariants.test.ts:159-174` fail nếu thiếu. (§7)

---

## §1. hooks-ts hôm nay

| Câu hỏi | Trả lời | Bằng chứng |
|---|---|---|
| Tên npm / version | **`hooks-ts`**, **0.12.0**, publish 2025-01-05 (`dist-tags.latest: 0.12.0`) | `packages/hooks-ts/package.json` `name`/`version` @ `9bd1243`; `npm view hooks-ts version dist-tags time` → `time[0.12.0] = 2025-01-05T16:29:40.662Z` |
| License | **MIT**, `Copyright (c) 2024 Michał Worwąg` | `LICENSE` @ `9bd1243` (nguyên văn ở §6); `package.json` `"license": "MIT"`; `npm view hooks-ts license` → `MIT`; GitHub API `license.spdx_id: MIT` |
| Dependencies runtime | **không có** — không có trường `dependencies` | `packages/hooks-ts/package.json` chỉ có `devDependencies` + `peerDependencies`; `npm view hooks-ts dependencies` in ra rỗng |
| Peer | `react ^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19 \|\| ^19.0.0-rc` | cùng file `peerDependencies`; `npm view hooks-ts peerDependencies` |
| Typecheck upstream bằng | `@types/react` **^18.3.12**, `react` ^18.3.1, TS ^5.7.2, vitest ^2.1.5, `@testing-library/react` ^16.0.1, jsdom ^26.0.0 | cùng file `devDependencies` |
| tsconfig upstream | `strict`, **`noUncheckedIndexedAccess: true`**, `verbatimModuleSyntax`, `moduleResolution: node`, `noEmit` | `packages/hooks-ts/tsconfig.json` — cùng hai cờ khắt khe nhất của `tooling/typescript/base.json`, nên §4.2 sạch không phải may |
| Layout repo | Monorepo pnpm 2 workspace: `packages/hooks-ts` (thư viện) + `apps/www` (Docusaurus, site hooks-ts.com). Mỗi hook một thư mục `src/<useFoo>/{useFoo.ts, index.ts, useFoo.test.ts?}`; `src/index.ts` là barrel 18 dòng `export * from './useX'` | `pnpm-workspace.yaml`; git tree `/git/trees/9bd1243?recursive=1` (106 blob không tính ảnh/lock) |
| Build / exports | tsup, entry duy nhất `src/index.ts`, `format: ['cjs','esm']`, `dts: true`; `exports` chỉ có `"."` (+ `./package.json`); `files: ["dist"]`; tarball 7 file, 32 610 byte | `packages/hooks-ts/tsup.config.ts`; `package.json` `exports`; `npm view hooks-ts dist.fileCount dist.unpackedSize` |
| CI upstream | `pnpm build && format && check-format && check-exports (attw) && lint (tsc)` — **không chạy `vitest run`** trong `ci` | `package.json` `scripts.ci`; `.github/workflows/ci.yml` chỉ gọi `pnpm run ci` |
| Hoạt động | Commit cuối `main`: `9bd1243` 2025-01-13 "Merge pull request #39 … bump nanoid" — 18 commit sau tag `hooks-ts@0.12.0` (`67a36cc`) chỉ đụng `dependabot.yml`, `ci.yml`, hai `package.json`, lockfile; **`packages/hooks-ts/src/**` không đổi** giữa tag và HEAD. `pushed_at` 2025-12-01 là nhánh `dependabot/npm_and_yarn/packages/hooks-ts/vitest-4.0.14`. 9 PR mở đều Dependabot (#52–#73), **0 issue mở**, 2 star, 0 fork, không archived, tạo 2024-11-22 | GitHub API `/repos/michal-worwag/hooks-ts`, `/commits?sha=main`, `/branches`, `/pulls?state=open`, `/issues?state=open`, `/compare/67a36cc...9bd1243` (5 file đổi, không có `src/`) |
| Nhánh chưa merge | `refactor/change-structure` (`5615737`, 4 commit 2025-09-21, ahead 4 / behind 0): "fix(useDarkMode): correct localStorage key handling and improve SSR support" `3750187` sửa `useDarkMode`, `useLocalStorage`, `useMediaQuery`, `useNetworkStatus` + husky. Chi tiết §4.3 | GitHub API `/compare/main...refactor/change-structure` |
| React 19 ở upstream | `useHover` đã đổi sang `React.RefObject<T \| null>` ở **0.8.1** ("fix: add missing null type to useHover", 2024-12-15); `useOnScreen` khai `RefObject<Element \| null>` từ đầu (0.12.0); `usePrevious` dùng `useRef<T>(value)` / `useRef<T \| undefined>(undefined)` — không có `useRef()` không đối số. Không có issue/PR nào về React 19 (vì không có issue nào cả) | `CHANGELOG.md` 0.8.1; `useHover.ts:4`; `useOnScreen.ts:12`; `usePrevious.ts:15-16` |
| Docs site | hooks-ts.com và `/docs/intro` liệt kê **18 hook** đúng như `src/index.ts`; intro nói "Documentation is being created"; **không** nêu phiên bản React, **không** có chính sách SSR; trang mỗi hook = mô tả + Usage + Returns + **nguyên văn source** ("## Hook"). Ba trang nhắc "server": `useIsomorphicLayoutEffect.md:6-8` (giải thích hook), `useNetworkStatus.md:33` và `useOnScreen.md` (chỉ là source in lại) | WebFetch hai trang; `apps/www/docs/*.md` (18 file + `intro.md`); `apps/www/src/libs/hooks.ts` (18 entry); `grep -in "ssr\|server\|hydrat" apps/www/docs/*.md` |
| Docs lệch source | `useHover.md` in bản **cũ** `React.RefObject<T>` (trước 0.8.1); `useDarkMode.md` in `[isDarkMode, setValue]` — `setValue` không tồn tại trong source; `usePrevious.md` viết `import usePrevious from 'hooks-ts'` (default import, package không có); README link `useDarkMode` trỏ nhầm `/docs/useDebounce` (nhánh refactor mới sửa) | so `apps/www/docs/<hook>.md` với `src/<hook>/<hook>.ts` |

Lịch sử thêm hook (`packages/hooks-ts/CHANGELOG.md`, GitHub releases): 0.1.0 `useSlugify` → 0.2.0 `useDebounce` → 0.3.0 `useLocalStorage`, `useMediaQuery` → 0.4.0 `useNetworkStatus` → 0.5.0 `useDarkMode`, `useHover` → 0.6.0 `useThrottle`, `useToggle` → 0.7.0 `useBoolean`, `useCountdown` → 0.8.0 `useCopyToClipboard` → 0.9.0 `useCounter`, `useIsomorphicLayoutEffect`, `useSessionStorage` → 0.10.0 `useTimeout` → 0.11.0 `usePrevious` → 0.12.0 `useOnScreen`. Không có hook nào bị xoá hay deprecate; **chưa từng có `useFetch`, `useIsClient`, `useIsMobile`** (kiểm tree ở 6 tag `017a747`, `635ad64`, `016f30d`, `a90abce`, `5ad0265`, `02229af` và toàn bộ CHANGELOG).

## §2. Inventory — 18 hook ở `9bd1243`

Đường dẫn: `packages/hooks-ts/src/<Tên>/<Tên>.ts`; mỗi thư mục còn `index.ts` (barrel một dòng) và test nếu có. "Dòng" là `wc -l` file gốc kể cả JSDoc/comment. Chỉ **một** hook import hook khác; không hook nào import package ngoài `react`.

| # | Hook | Làm gì (một dòng) | Dòng | Import | Test |
|---|---|---|---|---|---|
| 1 | `useBoolean` | `{ value, setValue, toggle, setTrue, setFalse }`; throw nếu default không phải boolean | 29 | `react` | `.test.ts` (58 dòng) |
| 2 | `useCopyToClipboard` | `[copiedText, copy]`, `copy: (text) => Promise<void>`; `console.warn` + return khi không có Clipboard API | 26 | `react` | `.test.ts` (45) |
| 3 | `useCountdown` | `(initialSeconds) → [timeLeft, reset]`; `setInterval` 1 s tạo lại mỗi tick vì deps `[timeLeft]` | 24 | `react` | `.test.ts` (40) |
| 4 | `useCounter` | `{ count, increment, decrement, reset, set }` | 20 | `react` | `.test.ts` (59) |
| 5 | `useDarkMode` | `[isDarkMode, toggle]`; đọc `localStorage.darkMode` → `prefers-color-scheme`; ghi class `dark-mode` lên `body` | 36 | `react`, **`../useLocalStorage`** | `.test.ts` (88) |
| 6 | `useDebounce` | `(value, delay) → debouncedValue` qua `setTimeout` trong effect | 17 | `react` | `.test.ts` (35) |
| 7 | `useHover` | `(RefObject<T \| null>) → boolean` qua `mouseenter`/`mouseleave` trong effect | 30 | `react` | `.test.ts` (38) |
| 8 | `useIsomorphicLayoutEffect` | `typeof window !== 'undefined' ? useLayoutEffect : useEffect` | 4 | `react` | **không** |
| 9 | `useLocalStorage` | `(key, initial) → [value, setValue]`; đọc trong `useState` initializer, ghi JSON; **không** `remove`, không sync tab, setter không nhận updater | 27 | `react` | `.test.ts` (31) |
| 10 | `useMediaQuery` | `(query) → boolean`; `useState(false)` rồi `setMatches` trong effect + `change` listener | 23 | `react` | **không** |
| 11 | `useNetworkStatus` | `() → boolean` từ `navigator.onLine` + `online`/`offline` | 24 | `react` | `.test.ts` (12) |
| 12 | `useOnScreen` | `(RefObject<Element \| null>, rootMargin) → boolean` qua `IntersectionObserver` | 31 | `react` | **không** |
| 13 | `usePrevious` | `(value) → T \| undefined` bằng hai ref ghi trong render | 24 | `react` | `.test.ts` (48) |
| 14 | `useSessionStorage` | `(key, initial) → [value, setValue, removeValue]`; thêm effect ghi `initialValue` vào storage nếu chưa có | 48 | `react` | `.test.ts` (84) |
| 15 | `useSlugify` | `(str) → slug` — **hàm thuần, không gọi hook nào** | 10 | — | `.test.ts` (9) |
| 16 | `useThrottle` | `(value, delay) → throttledValue` — **body giống hệt `useDebounce`** (setTimeout reset mỗi lần `value` đổi) | 18 | `react` | `.test.ts` (25) |
| 17 | `useTimeout` | `(callback, delay \| null)`; callback mới nhất qua ref ghi trong effect | 32 | `react` | `.test.ts` (57) |
| 18 | `useToggle` | `[state, toggle(value?)]` | 13 | `react` | `.test.ts` (38) |

Tổng **436 dòng** (cộng cột "Dòng"). Đối chiếu `useThrottle.ts` với `useDebounce.ts`: khác nhau đúng tên hàm/biến và một dòng comment — cùng một thuật toán (trailing debounce), nên "throttle" chỉ là tên. `useSlugify.ts` không `import` gì và không gọi hook — Biome/React không phàn nàn, nhưng nó không phải hook và không có lý do nằm trong một package hook.

## §3. Đồ thị phụ thuộc và "tập đóng nhỏ nhất"

```text
useLocalStorage ← useDarkMode          (useDarkMode.ts:2 — cạnh duy nhất trong 18 file)
17 hook còn lại: không import hook nào
```

| Muốn copy | Phải copy kèm | Dependency ngoài |
|---|---|---|
| Bất kỳ hook nào trừ `useDarkMode` | — | không |
| `useDarkMode` | `useLocalStorage` | không |

Không có `lodash`, không có `index.ts` bắc cầu cần giữ; `useEventListener`/`useEventCallback` kiểu usehooks-ts không tồn tại ở đây — mỗi hook tự `addEventListener` trong effect của mình. Đây là điểm khác cấu trúc lớn nhất so với usehooks-ts (note kia §3: 7 hook treo trên `useEventListener`, 4 hook treo trên `lodash.debounce`).

## §4. Từng hook có đáng copy không — đối chiếu rule của repo

### 4.1 Bảng đánh giá

Bốn cờ: **(a)** anti-pattern theo `.agents/rules/` và react.dev · **(b)** trùng thứ repo đã có · **(c)** SSR-hostile — quan trọng vì `packages/ui` được app Next và React Router dùng, và `reactrouter-server-modules.md` nói mọi thứ dưới `src/` "is compiled into **both** graphs" · **(d)** coupling nội bộ. Cột "Gate" là kết quả thật ở §4.2. Số dòng trích là của file upstream nguyên bản.

| Hook | (a) | (b) | (c) | (d) | Gate | Ghi chú kèm dẫn chứng |
|---|---|---|---|---|---|---|
| `useDebounce` | — | **đã có, trùng nguyên văn** (`packages/hook/src/use-debounce.ts`, chỉ khác thứ tự import) | an toàn | — | sạch | 3 consumer: `apps/documents` ×2 (`component-list.template.tsx:22`, `hook-list.template.tsx:19`), `apps/smart-rental/src/components/data-table/search-input.tsx:26` — cùng chữ ký `useDebounce(value, delay)`. Copy lại = không đổi gì ngoài header attribution |
| `useIsomorphicLayoutEffect` | — | **đã có, trùng 0 dòng** với hooks-ts *và* usehooks-ts | an toàn (`typeof window` ở module scope, chỉ đọc) | — | sạch | Bản 4 dòng này giống nhau ở cả hai thư viện, nên attribution về ai là câu hỏi mở (§6) |
| `useCopyToClipboard` | — | đã có, nhưng bản hiện tại là **usehooks-ts** (`copy` trả `Promise<boolean>`, `useCallback`); bản hooks-ts trả `Promise<void>`, không `useCallback`, `catch (error)` không dùng biến | `navigator` chỉ đọc trong callback — an toàn | — | Biome warning `noUnusedVariables` (`:20`) | 4 consumer (`documents` `code-block.tsx:88`, `install-capsule.tsx`; `smart-rental` `room-row-actions.tsx:32`, `contract-row-actions.tsx:30`) đều gọi `void copy(x)` — **không ai đọc boolean**, nên đổi sang bản hooks-ts không vỡ call site; nhưng là **đổi bản copy usehooks-ts đang có thành bản copy hooks-ts** để làm gì thì grill phải trả lời |
| `useMediaQuery` | (a) mềm: `setMatches(mediaQueryList.matches)` **đồng bộ trong effect** ngay khi mount (`:11`) — lint `set-state-in-effect` của React Compiler nói "Setting state immediately inside an effect forces React to restart the entire render cycle"; ngoại lệ được nêu là đo DOM qua ref, không phải `matchMedia` — **chưa xác minh** lint thật flag hay không (repo không cài `eslint-plugin-react-hooks`, Biome không có rule này) | đã có, nhưng bản hiện tại là **usehooks-ts** (61 dòng, `defaultValue`/`initializeWithValue`, `addListener` fallback) — hooks-ts là bản 23 dòng | **an toàn theo nghĩa không crash và không hydration mismatch** (server và client đều render `false` trước), nhưng client luôn paint sai một frame rồi mới đúng (`useEffect`, không phải layout effect) | — | sạch | Consumer SSR thật: `packages/ui/src/components/sidebar.tsx:10` qua `useIsMobile`. Bản hooks-ts đổi lấy *hydration-safe by construction* bằng *một frame sai*; bản usehooks-ts đổi lấy *đúng frame đầu* bằng *rủi ro mismatch nếu quên `initializeWithValue: false`* (note kia §4.1). Hướng react.dev cho "some value exposed by the browser that changes over time" là `useSyncExternalStore` với `getServerSnapshot` ("If you omit this argument, rendering the component on the server will throw an error") — không bản nào trong hai thư viện làm vậy |
| `useHover` | — | RR/Vite Template không có consumer; Base UI có state hover riêng cho primitive của nó — **chưa xác minh** ở mức source | `elementRef.current` đọc trong effect — an toàn | — | sạch (call site `useRef<HTMLDivElement>(null)` OK nhờ `RefObject<T \| null>` `:4`) | deps `[elementRef]` — element gắn muộn (render có điều kiện) sẽ không được attach; hành vi giống bản cũ của repo |
| `useOnScreen` | — | thay `use-on-screen` cũ — **cùng API** `(ref, rootMargin)` (bản cũ chính là copy của nó, §5) | `IntersectionObserver` chỉ trong effect — an toàn | — | Biome `useImportType` (`:1`, fixable) | `entry?.isIntersecting ?? false` (`:21`) đã xử lý `noUncheckedIndexedAccess`. Consumer tự nhiên: sentinel infinite-scroll ở `tanstack-consume-infinite.md` đang viết `IntersectionObserver` tay trong `useEffect`. Không có test upstream |
| `useTimeout` | — | `header-clock.tsx` ở Vite và RR Template đang `setInterval` tay (khác nhu cầu: interval, không timeout) | an toàn | — | sạch | `callbackRef.current = callback` **trong effect** (`:14-16`), đúng cách; `delay: null` tắt, `0` chạy. Bản cũ của repo trùng 0 dòng (§5). Không có `useInterval` trong hooks-ts |
| `useToggle` / `useBoolean` / `useCounter` | — | mỗi cái là 1–3 dòng `useState`; `useBoolean` throw runtime khi `typeof initialValue !== 'boolean'` (`:19-21`) — kiểm tra thứ TypeScript đã đảm bảo | — | — | `useBoolean` Biome `useImportType` (`:1`, fixable) | Không vi phạm rule nào; không app nào trong repo gọi. `useCounter` không `useCallback` (identity đổi mỗi render) — dưới React Compiler không quan trọng |
| `useCountdown` | — | thay `use-countdown` cũ — **cùng API** (bản cũ là copy của nó) | an toàn | — | sạch | deps `[timeLeft]` (`:21`) → clear + tạo interval mới **mỗi giây**; drift cộng dồn, và `reset()` giữa chừng làm tick tiếp theo đợi đủ 1 s mới từ mốc mới. Không sai, chỉ là `setTimeout` đội lốt `setInterval` |
| `usePrevious` | **(a)** `previousRef.current = …; currentRef.current = value` **trong render** (`:18-21`). react.dev `useRef`: "Do not write _or read_ `ref.current` during rendering, except for initialization"; lint `refs` của React Compiler flag "Reading `ref.current` during render" và "Updating `refs` during render", ngoại lệ chỉ cho lazy init `if (ref.current === null)`. Compiler gặp code "might break these rules" thì "safely skips optimization" — không lỗi, chỉ mất memo. Cách react.dev cho "storing information from previous renders" là `useState` + `if (prevCount !== count) { setPrevCount(count) … }` và nói thẳng "it's better than updating state in an effect" | — | — | — | sạch | Viết lại theo react.dev là 6 dòng và **không còn là copy**. usehooks-ts v3 cũng không có `usePrevious` |
| `useNetworkStatus` | **bug**: `const isServer = typeof window !== 'undefined'` (`:3`) — trên browser `isServer === true` nên khởi tạo luôn `true` thay vì `navigator.onLine`; trên server `isServer === false` → đọc `window.navigator.onLine` → **`ReferenceError` khi render SSR**. Nhánh `refactor/change-structure` đã sửa dấu (§4.3) nhưng chưa merge | — | **crash server** (`useState` initializer chạy trong render) | — | sạch (TS không thấy gì) | react.dev dùng đúng case này làm ví dụ `useSyncExternalStore` (`subscribe` gắn `online`/`offline`, `useOnlineStatus`). Test upstream chỉ assert `true` (`useNetworkStatus.test.ts:8-10`) nên bug không lộ |
| `useLocalStorage` | — | `apps/documents` và `apps/portfolio` có `theme-provider.tsx` tự đọc/ghi `localStorage` (CLAUDE.md §1 `documents`: "a context, an effect and one `localStorage` key, no store") | **`window.localStorage.getItem(key)` trong `useState` initializer (`:9`), không guard** → `ReferenceError: window is not defined` trên server. `try/catch` bao quanh (`:8-14`) — `ReferenceError` **bị nuốt** thành `console.error` + `initialValue`, nên không crash nhưng log lỗi mỗi request và render server ≠ client khi key có giá trị → hydration mismatch | `useDarkMode` cần nó | sạch | Không `remove`, không sync tab, setter không nhận updater — kém `useSessionStorage` cùng repo. Nhánh refactor thêm guard + updater + `isLocalStorageAvailable` (§4.3) |
| `useSessionStorage` | (a) mềm: effect `[key, initialValue]` (`:40-45`) ghi `initialValue` vào storage khi chưa có — `initialValue` là object literal thì effect chạy mỗi render (chỉ `getItem` rồi thôi) | như trên | **`sessionStorage.getItem(key)` trong initializer (`:12`) không guard** — trên server `sessionStorage` không tồn tại → `ReferenceError` nuốt vào `try/catch` → cùng hệ quả `useLocalStorage`; effect `:41` thì chỉ chạy client | — | sạch | Có `removeValue` — bản đầy đủ hơn `useLocalStorage`; nếu copy cả hai thì hợp làm một hàm nhận `Storage` là đúng `quality-simplicity` hơn |
| `useDarkMode` | **(a)** hai state cho một giá trị (`isDarkMode` + `darkMode` từ `useLocalStorage`, biến sau không dùng — `:15-16` có `eslint-disable`); effect `[isDarkMode, setDarkMode]` (`:33`) với `setDarkMode` là hàm mới mỗi render → **ghi localStorage + set class mỗi render**; ghi DOM `document.body.classList` là side-effect ngoài React tree, hard-code key `darkMode` và class `dark-mode` | hai app đã có theme provider riêng; theme của repo là `dark` class trên `html` qua `tooling/tailwind` — **chưa xác minh** selector chính xác trong `theme.css` | **crash server**: `localStorage.getItem` + `window.matchMedia` trong initializer (`:7-11`) **không try/catch** | `useLocalStorage` | Biome warning `noUnusedVariables` (`:16`) | Nhánh refactor guard `isServer` và `useCallback` (§4.3) nhưng vẫn giữ hai state và class trên `body` |
| `useThrottle` | **bug về tên**: body = `useDebounce` (`:6-15`) — mọi thay đổi trong `delay` ms đều reset timer, không có "at most once per delay". Docs hứa "updated at most once every specified delay period" (`useThrottle.md`) | — | an toàn | — | sạch | Test `useThrottle.test.ts:15-17` gán `result.current = 'test2'` rồi assert `result.current === 'test2'` — không rerender, không chứng minh gì. Bản cũ của repo là copy của nó, note kia §5 đã nhận ra "Bug: body giống hệt use-debounce" |
| `useSlugify` | không phải hook (không gọi hook, không `import`); tên `use*` chỉ khiến caller tưởng phải gọi trong component | — | — | — | sạch | Hàm 10 dòng thuần — nếu cần thì là `~/utils`, không phải `@monorepo/hook` |

### 4.2 Bằng chứng Gate — chạy thật trên 18 file

Cách chạy: copy 18 file `src/<useFoo>/<useFoo>.ts` vào scratchpad thành `use-foo.ts` (flat, kebab-case), đổi dòng import duy nhất `'../useLocalStorage'` → `'./use-local-storage'` (`use-dark-mode.ts:2`), thêm `call-site.tsx` gọi `useHover(divRef)` và `useOnScreen(divRef, "-50px")` với `const divRef = useRef<HTMLDivElement>(null)` (kiểu React 19), cộng `useDebounce`/`useLocalStorage`. `tsconfig` `extends` `D:/Personal/monorepo/tooling/typescript/base.json` (`strict`, `noUncheckedIndexedAccess`), `lib` `["dom","dom.iterable","esnext"]`, `jsx: react-jsx`, `types: ["react"]`, `typeRoots`/`paths` trỏ `packages/hook/node_modules/@types/react` **19.2.18**. Chạy `packages/hook/node_modules/.bin/tsc` (**7.0.2**):

```text
tsc --noEmit -p tsconfig.json   → exit 0, 0 lỗi   (có call-site.tsx)
tsc --noEmit -p tsconfig.json   → exit 0, 0 lỗi   (không call-site.tsx)
```

Không có `useRef()` không đối số nào (React 19 Upgrade Guide: "`useRef` now requires an argument"); hai hook nhận ref khai `RefObject<T | null>` / `RefObject<Element | null>`, đúng convenience overload "`useRef<T>(null)` … automatically returns `RefObject<T | null>`". Upstream đã bật `noUncheckedIndexedAccess` nên `useOnScreen.ts:21` viết `entry?.isIntersecting ?? false` sẵn.

`biome lint` của repo (Biome 2.5.12, `biome.json` root copy vào scratch với `vcs.enabled: false`, `files.includes: ["src/**"]`, bỏ `overrides`):

```text
src/use-boolean.ts:1:8      lint/style/useImportType  FIXABLE  × Separate type imports from other imports.
src/use-on-screen.ts:1:8    lint/style/useImportType  FIXABLE  × (như trên)
src/use-copy-to-clipboard.ts:20:14  lint/correctness/noUnusedVariables  ! This variable error is unused.
src/use-dark-mode.ts:16:10  lint/correctness/noUnusedVariables  ! This variable darkMode is unused.
Found 2 errors. Found 2 warnings.        (2 error a11y còn lại nằm ở call-site.tsx tự viết, không tính)
```

`biome format`: **18/18 file** lệch (nháy đơn, `interface`/dấu phẩy — upstream dùng Prettier `.prettierrc` `singleQuote`). Sau `biome check --write` trên bản copy: **0 error, 2 warning** (hai `noUnusedVariables` trên, unsafe fix nên `--write` không tự sửa), `useImportType` đã tách thành `import type { Dispatch, SetStateAction } from "react"`. `biome check` **exit 0 khi chỉ còn warning** — tức `bun run check` (= `biome check .`, root `package.json:29`) **xanh** với hai warning đó. Để sạch hẳn: bỏ tên biến `catch (error)` → `catch {` ở `use-copy-to-clipboard.ts:20` và bỏ dòng `const [darkMode, …]` ở `use-dark-mode.ts:16` (chỉ giữ `setDarkMode`).

So với usehooks-ts (note kia §4.2: 5 lỗi TS + 4 lỗi call site + 9 error Biome), hooks-ts qua Gate **rẻ hơn hẳn** — vì nó đơn giản hơn, không phải vì đúng hơn: mọi vấn đề ở §4.1 (crash SSR, bug dấu, throttle giả, ref-in-render) đều là thứ TypeScript và Biome **không nhìn thấy**.

### 4.3 Nhánh `refactor/change-structure` — bản vá chưa merge của chính tác giả

`3750187` (2025-09-21) "fix(useDarkMode): correct localStorage key handling and improve SSR support" sửa 4 file, so với `main`:

- `useNetworkStatus.ts`: `typeof window !== 'undefined'` → **`=== 'undefined'`** (sửa bug dấu), thêm `if (isServer) return;` trong effect.
- `useMediaQuery.ts`: `useState(false)` → lazy initializer `isServer ? false : window.matchMedia(query).matches` — tức đổi từ "false rồi đúng" sang đúng ngay trên client, **và đổi luôn sang hydration mismatch** khi server render `false` mà client khởi tạo `true` (cùng cái bẫy `initializeWithValue: true` của usehooks-ts).
- `useLocalStorage.ts`: thêm `isServer` guard + `isLocalStorageAvailable()` (ghi/xoá key test), setter nhận updater `T | ((prev: T) => T)`, `useCallback([key, storedValue])`.
- `useDarkMode.ts`: guard `isServer` + try/catch trong initializer, `useCallback`, tách hai effect, cleanup gỡ class — vẫn hai state, vẫn `body.classList`.

Bốn file này chưa có tag, chưa lên npm, và nhánh đứng từ 2025-09-21. Nếu copy thì đây là bản "tốt hơn main" của đúng bốn hook yếu nhất — nhưng pin vào một nhánh chưa merge là pin vào thứ có thể bị rebase/xoá (`raw.githubusercontent.com/michal-worwag/hooks-ts/3750187/...` vẫn resolve chừng nào commit còn reachable). Câu hỏi mở.

## §5. So với 14 hook cũ (`1c9eaa1^`) và 5 hook hiện tại

`git show 1c9eaa1^:packages/hook/src/hooks/<name>.ts`; ngày thêm file lấy từ `git log --diff-filter=A --follow`. So bằng `diff` sau khi chuẩn hoá nháy/chấm phẩy/thụt đầu dòng, bỏ comment và dòng trống.

| Hook cũ (ngày thêm) | So với hooks-ts @ `9bd1243` | Bản hiện tại (5 hook, `b0567be`) |
|---|---|---|
| `use-copy-to-clipboard` (ae43065, 2025-11-30) | **5 dòng khác** với `useCopyToClipboard`: `export function` vs `export const … =>`, thêm một dòng `console.log("Error", error)`. Note kia §5 gọi bản này là "viết lại đơn giản" — thực ra là copy hooks-ts | **= usehooks-ts 3.1.1** (note kia §5), *không* phải hooks-ts |
| `use-countdown` (ae43065) | **2 dòng khác** (thứ tự import). Note kia gọi là "tự viết" — là copy hooks-ts | bỏ |
| `use-debounce` (ae43065) | **2 dòng khác** (thứ tự import) | giữ nguyên — **= hooks-ts `useDebounce`**, 2 dòng khác. Note kia gán cho `useDebounce` v2 của usehooks-ts (3 dòng khác) và tự nhận "không khẳng định được"; nay có nguồn khớp hơn |
| `use-fetch` (67785c7, 2025-08-10) | **không có** trong hooks-ts ở tag nào | bỏ — đúng, `react-effects-sync-only.md` |
| `use-hover` (ae43065) | **4 dòng khác**: import order + `React.RefObject<T>` vs `<T \| null>` — bản cũ khớp hooks-ts **trước 0.8.1** hoặc chép từ `useHover.md` (docs vẫn in bản cũ, §1) | bỏ |
| `use-is-client` (67785c7) | **không có** trong hooks-ts | bỏ |
| `use-is-mobile` (5720d5b, 2025-11-28) | không liên quan — hook `use-mobile` shadcn sinh (note kia §5) | viết lại trên `useMediaQuery` |
| `use-isomorphic-layout-effect` (40594a0, 2025-12-03) | bản cũ **sai** (hàm trả về hook — note kia §5); upstream là `const` 4 dòng | **= hooks-ts và = usehooks-ts, 0 dòng khác** |
| `use-local-storage` (67785c7) | **0 dòng khác** với `useLocalStorage`. Note kia mô tả đúng triệu chứng ("đọc `window.localStorage` trong initializer không guard, không sync tab, không `remove`") nhưng gán "tự viết" | bỏ |
| `use-media-query` (ae43065) | **2 dòng khác** với `useMediaQuery` hooks-ts (thứ tự import) | **= usehooks-ts** (61 dòng), *không* phải hooks-ts |
| `use-network-status` (ae43065) | **0 dòng khác** — kể cả bug `isServer` đảo dấu, chính là `useNetworkStatus.ts:3` upstream | bỏ |
| `use-on-screen` (ae43065) | **5 dòng khác** (tách `import type`, bỏ annotation `rootMargin: string`) — cùng API | bỏ |
| `use-throttle` (ae43065) | **2 dòng khác** với `useThrottle` — bug "không throttle" là của upstream | bỏ |
| `use-timeout` (ae43065) | **0 dòng khác** với `useTimeout`. Note kia gọi là "gần-copy usehooks-ts, dùng `useEffect` thay layout effect" — chính là bản hooks-ts nguyên văn | bỏ |

Kết luận: **11/14 hook cũ là copy hooks-ts** (9 hook thêm cùng commit `ae43065` 2025-11-30, 2 hook từ `67785c7` 2025-08-10 — `use-local-storage` và một hook không thuộc hooks-ts), 3 hook còn lại (`use-fetch`, `use-is-client`, `use-is-mobile`) không phải. Repo **chưa từng ghi tên hooks-ts ở đâu** (`grep -rn "hooks-ts\|michal-worwag"` chỉ ra note usehooks-ts). Trong 5 hook hiện tại: 2 là hooks-ts (`use-debounce`, `use-isomorphic-layout-effect` — file sau đồng thời trùng usehooks-ts), 2 là usehooks-ts (`use-copy-to-clipboard`, `use-media-query`), 1 tự viết (`use-is-mobile`).

Khác biệt API đáng để ý nếu copy đè bản hiện tại: `useCopyToClipboard` `Promise<boolean>` → `Promise<void>` (không consumer nào đọc, §4.1); `useMediaQuery(query, { defaultValue, initializeWithValue })` → `useMediaQuery(query)` (consumer duy nhất `use-is-mobile.ts:8` gọi một đối số — không vỡ, nhưng README shell `hook-public/README.md` đang mô tả hai option, và hành vi SSR đổi như §4.1).

## §6. Licensing — MIT © 2024 Michał Worwąg yêu cầu gì

Văn bản gốc (`LICENSE` @ `9bd1243`, giống hệt template MIT):

> MIT License
> Copyright (c) 2024 Michał Worwąg
> […] **The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.**

Cơ chế MIT khi copy source — điều kiện, "substantial portion", SPDX một dòng không thay được permission notice, hai tarball phân phối (`@fe-monorepo/hook` và `@fe-monorepo/ui` qua `dist/internal/`) cộng repo GitHub công khai — đã viết đầy đủ ở [note usehooks-ts §6](./usehooks-ts-manual-copy.md#§6-licensing--mit-yêu-cầu-gì-khi-copy-source); không lặp lại, chỉ khác tên và năm. Cơ chế cụ thể cho repo, xếp theo lượng file phải sửa:

1. `packages/hook/LICENSE-hooks-ts` chứa nguyên văn `LICENSE` upstream + một dòng đầu "Applies to files marked `Derived from hooks-ts` in `src/`". Thêm `"LICENSE-hooks-ts"` vào `files` của `packages/hook-public/package.json:23-27` (hiện `["dist", "README.md", "CHANGELOG.md"]`) và của `packages/ui-public/package.json:28-32` (cùng ba mục) chừng nào `ui-public` còn vendor `../hook/src/*.ts`. `npm pack` chỉ mang thứ `files` liệt kê.
2. Header 2–3 dòng đầu mỗi file copy: `// Derived from hooks-ts <useFoo>.ts @ 9bd1243 (hooks-ts@0.12.0), MIT © 2024 Michał Worwąg — see LICENSE-hooks-ts`. Cũng là metadata re-sync (§7.4). `quality-code-comments.md` cho phép comment "why" — nguồn gốc và license là "why".
3. `packages/hook-public/README.md:58` (hiện "## License — MIT") và `packages/ui-public/README.md:204`: thêm mục "Third-party notices" nêu hooks-ts, link repo, license.

**Nợ đang có, giờ lớn hơn note kia ghi**: note usehooks-ts §6 nói ba file hiện tại là copy usehooks-ts không notice (`use-media-query`, `use-copy-to-clipboard`, `use-isomorphic-layout-effect`). Thêm §5 trên: `use-debounce.ts` hiện tại là copy hooks-ts, và `use-isomorphic-layout-effect.ts` trùng cả hai — tức **4/5 file hiện tại có nguồn ngoài, hai license khác nhau, chưa file nào có notice**, và bản 1.0.0 của `@fe-monorepo/hook` (README shell nói "The `1.0.0` line published 14 hooks from the pre-Skeleton codebase") đã phân phối 11 hook hooks-ts **chưa xác minh** đã thực sự lên registry hay chưa. Với một file 4 dòng `const x = typeof window !== 'undefined' ? useLayoutEffect : useEffect` giống nhau ở hai thư viện và ở hàng trăm codebase, "substantial portion" có áp dụng không là câu grill chốt, không phải note này.

## §7. Cơ chế "copy tay" trong repo này

### 7.1 Tên file, export, barrel

- Upstream: thư mục camelCase `useFoo/useFoo.ts` + `index.ts` một dòng + `src/index.ts` barrel 18 dòng; `exports` chỉ có `.`.
- Repo: flat kebab-case `packages/hook/src/use-foo.ts`, không barrel (`quality-avoid-barrel-imports.md`), `exports: { "./*": "./src/*.ts" }` (`packages/hook/package.json`); shell `"./*": { types: "./dist/*.d.ts", import: "./dist/*.js" }` (`packages/hook-public/package.json:28-33`).
- Việc mỗi file: đổi tên `useFoo.ts` → `use-foo.ts` (§4.2 đã làm bằng `sed` — tên nào cũng ra đúng, kể cả `useIsomorphicLayoutEffect` → `use-isomorphic-layout-effect`); đổi **một** import `'../useLocalStorage'` → `"./use-local-storage"`; bỏ `index.ts`; giữ `export function useFoo` (named — bảng `quality-imports.md`). Hai file `export const useFoo = () =>` (`useCopyToClipboard`, `useIsomorphicLayoutEffect`) vẫn là named export, không cần đổi.
- Hai hook có chữ ký khác bản hiện tại (`useCopyToClipboard`, `useMediaQuery`) — nếu copy đè thì README shell phải viết lại hai hàng bảng "Hooks".

### 7.2 Build, smoke — dẫn lại, đã verify lại output

`packages/hook/rslib.config.ts`: `bundle: false`, `format: esm`, `entry: { index: ["./src/**/*.ts"] }`, `dts: true`, `distPath.root: "../hook-public/dist"`, `cleanDistPath: true`. Output thật hiện có `packages/hook-public/dist/use-media-query.js:2` = `import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";` — rslib rewrite `.js`, nên import nội bộ `./use-local-storage` của `use-dark-mode` chỉ cần viết không đuôi. Glob `src/**/*.ts` cũng bắt mọi `.ts` trong `src/` — test không được nằm đó. `scripts/lib/consumer-smoke.ts:58-70` chỉ import `@fe-monorepo/hook/use-debounce` trong consumer Vite + React 19 — một hook copy vào có lỗi type chỉ lộ ở `typecheck` của `packages/hook`, không ở smoke. Chi tiết: note usehooks-ts §7.2.

### 7.3 Ba nơi tự động "mang theo" mọi file trong `packages/hook/src/`

- `packages/ui/rslib.config.ts:63-69`: `entry: { internal: ["../hook/src/*.ts"] }` compile **cả package** vào `ui-public/dist/internal/`; comment tự ghi "Five files come to 2.6 kB". 18 hook = ~436 dòng dead code trong tarball `@fe-monorepo/ui` (không reachable từ `exports` của shell) + nghĩa vụ notice kép (§6). Không có `lodash` nên không có vấn đề `externals` như usehooks-ts.
- `apps/documents/scripts/docs-metadata.ts:227-228`: `readdirSync("packages/hook/src").filter(endsWith(".ts"))` → **mỗi file một trang** `/hooks/<slug>`; mô tả lấy từ **JSDoc block ngay trên export đầu tiên** (`extractDescription`, `:100-130`) — 16/18 hook upstream **không có** JSDoc (chỉ `useCountdown`, `useOnScreen`, `usePrevious`, `useTimeout` có), nên `description` là `null`.
- `apps/documents/test/generated/catalogue-invariants.test.ts:78-85` bắt catalogue = đúng tập file trong `packages/hook/src`, và **`:159-174` bắt mỗi slug phải có `documents.hooks.items.<slug>.description` trong mọi ngôn ngữ** (`packages/i18n/src/locales/vi.json:378-392` hiện có 5 key). Thêm một hook mà quên hai chuỗi i18n là Gate `test` đỏ — đây là seam cứng nhất trong ba.

### 7.4 Giữ cho re-sync được

Tag `hooks-ts@0.12.0` là annotated tag `c36935e` → commit `67a36cc`; `src/` ở đó **byte-identical** với `9bd1243` (compare API: 5 file khác, không có `src/`). URL ổn định: `raw.githubusercontent.com/michal-worwag/hooks-ts/9bd12431bb24b84d211f0d735c6bef79fe1be85a/packages/hooks-ts/src/<Hook>/<Hook>.ts`. Ghi SHA đầy đủ + version vào header mỗi file (§6 mục 2). Nhưng: mỗi sửa để hợp rule (`usePrevious` sang `useState`, guard SSR cho ba hook storage/dark-mode, sửa dấu `useNetworkStatus`, viết throttle thật) làm file **không còn nguyên văn** — re-sync là merge tay. Với upstream đứng yên 20 tháng, 0 issue, nhánh fix chưa merge từ 2025-09, lượng re-sync thực tế có thể là 0 — cũng là câu hỏi mở.

### 7.5 Test — đã chạy thật

Upstream: `vitest.config.ts` = `{ globals: true, environment: 'jsdom' }`, không `setupFiles`; test import tường minh `describe/it/expect/vitest` từ `'vitest'` (nên `globals` không cần), `renderHook`/`act`/`fireEvent` từ `@testing-library/react`, `vitest.useFakeTimers()` (4 file) hoặc `vi.` (2 file); `test/mocks.ts` gắn `localStorage`/`sessionStorage` mock lên `window` khi được import (`useLocalStorage.test.ts:2`). 15/18 có test; thiếu `useIsomorphicLayoutEffect`, `useMediaQuery`, `useOnScreen`. CI upstream **không chạy test** (§1).

Chạy trong scratchpad với đúng package của repo (link tuyệt đối vào Bun store của `packages/i18n/node_modules`: vitest 5.0.0, `@testing-library/react` 16.3.3, react/react-dom 19.2.8, jsdom 30.0.1), test đổi import `'./useFoo'` → `'../src/use-foo'`:

```text
 RUN  v5.0.0
 Test Files  15 passed (15)
      Tests  50 passed (50)
   Duration  23.58s
```

Không phải sửa gì ngoài đường import. Chất lượng không đều: `useThrottle.test.ts:15-17` gán `result.current` thay vì rerender (test luôn xanh); `useNetworkStatus.test.ts` một assert `true` (bug dấu không lộ); `useDarkMode.test.ts` mock `matchMedia` thủ công 2 lần. Mang test sang repo theo khuôn `packages/i18n/vitest.config.ts` (`process.env.TZ = "UTC"` module scope, `environment: "jsdom"`, `include: ["test/**/*.{test,spec}.{ts,tsx}"]`, `clearMocks: true`) + `package.json` thêm `test`/`test:watch` và devDeps từ `catalog:testing` — `packages/hook` hiện chưa có script `test` (`package.json:9-13`). Test nằm ở `packages/hook/test/use-foo.test.ts` soi gương `src/` (`testing-coverage.md`), không nằm cạnh source như upstream — thêm lý do: glob `src/**/*.ts` của rslib và `*.ts` của `apps/documents` (§7.3). Đổi `vitest.useFakeTimers()` → `vi.useFakeTimers()` là tuỳ chọn (cả hai là alias); `mocks.ts` sang `test/support/`.

## §8. Câu hỏi mở cho grill

- **Mục tiêu của `@fe-monorepo/hook` là gì?** 3 hook có consumer (`use-debounce` ×3, `use-copy-to-clipboard` ×4, `use-is-mobile` ×1) hay "một thư viện hook công bố"? Câu này quyết `useBoolean`/`useCounter`/`useToggle` (sạch nhưng không ai gọi) và `useSlugify` (không phải hook).
- **Copy từ `main` (`9bd1243`, có tag, có npm) hay từ nhánh `refactor/change-structure` (`3750187`, sửa 4 hook yếu nhất, chưa merge)?** Hay copy `main` rồi vá theo đúng nhánh đó — khi ấy header ghi SHA nào?
- **Bốn hook SSR-hostile (`useDarkMode`, `useLocalStorage`, `useSessionStorage`, `useNetworkStatus`) có vào không?** `packages/ui` chạy trong Next/RR; hai app đã có theme provider riêng. Nếu vào thì guard `typeof window` là bắt buộc và file không còn nguyên văn.
- **`useMediaQuery`: giữ bản usehooks-ts đang có, đổi sang bản hooks-ts 23 dòng (một frame sai, không mismatch), hay viết `useSyncExternalStore` + `getServerSnapshot` theo react.dev?** Hook duy nhất có consumer SSR thật (`sidebar.tsx`).
- **`useThrottle` (không throttle) và `usePrevious` (ref-in-render): bỏ, hay copy rồi viết lại?** Viết lại xong thì còn gọi là copy không, và notice có còn cần không.
- **Attribution cho nợ hiện hữu**: 4/5 file hiện tại có nguồn ngoài, hai license (usehooks-ts © Julien CARON, hooks-ts © Michał Worwąg), và bản 1.0.0 đã phân phối 11 hook hooks-ts — làm ticket riêng trước, độc lập với việc copy thêm?
- **`ui-public` có tiếp tục vendor cả `packages/hook/src/*.ts`?** 18 hook là ~436 dòng dead code + notice trong tarball `@fe-monorepo/ui`; thu hẹp glob về `use-is-mobile` + 2 dep, hay chấp nhận.
- **`apps/documents`: mỗi hook copy vào là một trang + hai chuỗi i18n bắt buộc** (`catalogue-invariants.test.ts:159`) và cần JSDoc để có `description`. Ai viết 2×N mô tả, và có muốn site docs liệt kê hook mà app nào trong repo cũng không dùng?
- **Có mang 15 test upstream không?** Chúng chạy xanh ngay, là lý do mạnh để `packages/hook` có script `test` lần đầu; nhưng cũng là code MIT (cùng notice), và hai trong số đó không chứng minh gì (`useThrottle`, `useNetworkStatus`) — mang nguyên hay viết lại hai cái đó.
- **Nhóm "sạch, có consumer tự nhiên" nếu chỉ lấy một phần**: `useOnScreen` (sentinel ở `tanstack-consume-infinite.md`), `useTimeout` (nhưng hai `header-clock.tsx` cần interval, hooks-ts không có `useInterval`), `useHover`, `useToggle`. Còn `useCountdown` (interval tạo lại mỗi giây) có đáng hơn viết tay không.
