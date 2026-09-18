# Copy tay hook từ usehooks-ts vào `@monorepo/hook` — khảo sát trước khi grill

> **Khảo sát nhầm thư viện.** Chủ repo thật ra muốn `hooks-ts` (michal-worwag) — quyết định cuối
> ở [`hooks-ts-manual-copy.md`](./hooks-ts-manual-copy.md) và ADR-0010 dựa trên thư viện đó, không
> phải `usehooks-ts` (juliencrn) mà note này khảo sát. Giữ lại vì note kia vẫn dẫn tới các fact
> **phía repo** dưới đây (§5, §6, §7) bằng đường dẫn — chỉ mọi claim về **thư viện ngoài** trong
> note này (tên hook, license year, số hook, trạng thái upstream) mới sai; đọc `hooks-ts-manual-copy.md`
> cho phần đó.
>
> Ngày kiểm tra: **2026-09-17**, nhánh `dev`, HEAD `f54dad3`. Nguồn: chỉ primary sources — source thật của usehooks-ts tải từ `raw.githubusercontent.com` **pin ở commit `6194913`** (`61949134144d3690fe9f521260a16c779a6d3797`, HEAD của `master`, ngày 2025-02-05, chính là commit của tag `usehooks-ts@3.1.1`), GitHub API của repo đó, `npm view usehooks-ts`, trang https://usehooks-ts.com/introduction, react.dev, và file thật trong repo này (đường dẫn kèm số dòng, `git show` kèm hash). Hai kiểm tra chạy thật: `tsc` của repo (TypeScript 7.0.2, `@types/react` 19.2.18, `tooling/typescript/base.json`) và `biome lint` của repo trên 33 file upstream, trong thư mục scratchpad, không đụng repo. Mọi claim có citation; chỗ chưa verify được ghi rõ **"chưa xác minh"**.
>
> **Phạm vi:** chủ repo muốn copy tay source hook của usehooks-ts vào `packages/hook/src/` (một file một hook, không depend npm package) để dựng lại `@monorepo/hook` — thứ được publish lên npm dưới tên `@fe-monorepo/hook` qua Publish shell `packages/hook-public` (ADR-0004). Note này trả lời *copy được gì, copy thế nào, và giá của từng hook* — quyết định là của phiên grill sau. Không file nào ngoài note này được sửa.

## Tóm tắt kết luận

1. **usehooks-ts 3.1.1 có 33 hook, MIT, một dependency runtime là `lodash.debounce ^4.0.8`, và đã đứng yên 19 tháng.** Commit cuối trên `master` là 2025-02-05 ("🔖 Update version"); `pushed_at` 2026-09-16 chỉ là các PR Renovate chưa merge; 129 issue mở; các PR "Add React 19 support" (#675), "Change the type of refs for react 19" (#680), "fix: update RefObject<T> to RefObject<T | null> for React 19" (#724, mở 2026-05-08) đều **chưa merge**. Peer là `react ^16.8 || ^17 || ^18 || ^19`, nhưng upstream typecheck với `@types/react` **18.2.73**. (§1)
2. **Dưới `tsconfig` của repo này (TS 7, `@types/react` 19, `noUncheckedIndexedAccess`), 33 file upstream ra 5 lỗi ở 4 hook** (`useDebounceCallback`, `useIntersectionObserver`, `useResizeObserver`, `useTernaryDarkMode`), và **mọi hook nhận `RefObject<T>` — `useEventListener`, `useHover`, `useOnClickOutside`, `useResizeObserver` — từ chối `useRef<HTMLDivElement>(null)` của React 19** (4 lỗi ở call site). `biome lint` của repo ra 9 error + 10 warning. Copy nguyên xi không qua Gate. (§4.2)
3. **Ba trong năm hook hiện tại đã là bản copy nguyên văn của usehooks-ts mà không có attribution**: `use-media-query.ts` (khác 4 dòng, đều là đường import và `interface`→`type`), `use-copy-to-clipboard.ts` (khác 1 dòng, dấu ngoặc tham số), `use-isomorphic-layout-effect.ts` (0 dòng khác). MIT yêu cầu "the above copyright notice and this permission notice shall be included in all copies or substantial portions" — nghĩa vụ này **đã phát sinh từ `b0567be`**, không phải chờ đợt copy mới. (§5, §6)
4. **Bốn hook dính `lodash.debounce` bắc cầu** (`useDebounceCallback`, `useDebounceValue`, `useWindowSize`, `useScreen`); shell `hook-public` hiện chỉ có peer `react`/`react-dom`, không có `dependencies`. Rule `patterns-debounce-search-input.md:80` còn nói thẳng "value form only; there is no `useDebouncedCallback` on web". Đây là nhóm cần quyết định trước tiên. (§3, §4.1)
5. **Sáu hook viết/đọc `ref.current` hoặc gọi setter ngay trong render, hoặc set state trong effect để derive** (`useUnmount:18`, `useIntersectionObserver:99`, `useResizeObserver:62`, `useDebounceValue:61-64`, `useDarkMode:69-73`, `useIsClient:3-6`) — trái react.dev "Do not write or read `ref.current` during rendering" và hai lint `refs` / `set-state-in-effect` của `eslint-plugin-react-hooks`, tức thứ React Compiler (bật ở cả ba Template) dựa vào. Copy được, nhưng phải sửa, và sửa xong thì không còn "re-sync" nguyên văn nữa. (§4.1)
6. **Cơ chế copy hợp với repo đã có sẵn, không cần thêm gì**: `exports: "./*"` + rslib `bundle: false` đã rewrite `./use-x` → `./use-x.js` (thấy trong `packages/hook-public/dist/use-media-query.js:2`); nhưng **mọi file thêm vào `packages/hook/src/` cũng bị `packages/ui/rslib.config.ts:68` biên dịch vào `ui-public/dist/internal/`** và bị `apps/documents` sinh thành một trang docs (`docs-metadata.ts:227-228`). Một hook copy vào là ba nơi phải mang nó. (§7)
7. **Có test để mang theo**: 29/33 hook có `.test.ts(x)` (vitest + `@testing-library/react`, `globals: true`, jsdom); 4 hook không có test là `useIntersectionObserver`, `useIsomorphicLayoutEffect`, `useMediaQuery`, `useScreen`. `packages/hook` hiện không có script `test`; thêm theo đúng khuôn `packages/i18n/vitest.config.ts` là đủ. (§7.5)

---

## §1. usehooks-ts hôm nay

| Câu hỏi | Trả lời | Bằng chứng |
|---|---|---|
| Version npm | **3.1.1**, publish 2025-02-05 | `npm view usehooks-ts version time` → `3.1.1`, `"3.1.1": "2025-02-05T23:18:19.076Z"` |
| License | MIT, `Copyright (c) 2020 Julien CARON` | `LICENSE` ở root repo, commit `6194913` |
| Dependencies runtime | **`lodash.debounce ^4.0.8`** — vẫn còn | `packages/usehooks-ts/package.json` `dependencies`; `npm view usehooks-ts dependencies` → `{ 'lodash.debounce': '^4.0.8' }` |
| Peer | `react ^16.8.0 || ^17 || ^18 || ^19 || ^19.0.0-rc` | cùng file, `peerDependencies`; thêm ở `b1dffb9` "feat: Update peerDependencies to include React 19 (#651)" |
| Typecheck upstream bằng | `@types/react` **18.2.73**, `react` 18.2.0, TS ^5.3.3, vitest ^1.3.1, `@testing-library/react` ^14.2.1 | cùng file, `devDependencies` |
| Build | tsup, **một** entry `src/index.ts`, ra `dist/index.js` + `index.cjs`; `exports` chỉ có `.` (barrel) | `packages/usehooks-ts/tsup.config.ts`; `package.json` `exports` |
| Hoạt động | Commit cuối `master`: `6194913` 2025-02-05. `pushed_at` 2026-09-16 = branch Renovate ("Update all non-major dependencies", "Update testing-library monorepo (major)", `merged_at: null`). 129 issue mở, 7 857 star, không archived | GitHub API `/repos/juliencrn/usehooks-ts`, `/commits?sha=master`, `/pulls?sort=updated` |
| React 19 ở upstream | Issue [#663](https://github.com/juliencrn/usehooks-ts/issues/663) "[BUG] useOnClickOutside doesn't allow null ref" mở từ 2024-12-16; PR [#675](https://github.com/juliencrn/usehooks-ts/pull/675) "Add React 19 support", [#680](https://github.com/juliencrn/usehooks-ts/pull/680), [#711](https://github.com/juliencrn/usehooks-ts/pull/711), [#724](https://github.com/juliencrn/usehooks-ts/pull/724) — **tất cả `state: open`** | GitHub search API `repo:juliencrn/usehooks-ts RefObject null react 19` |
| Docs site | https://usehooks-ts.com/introduction liệt kê đúng 33 hook như `src/`; **không** nêu phiên bản React hỗ trợ, **không** nêu chính sách SSR; chỉ nói "fully tree-shakable (using the ESM version)" | WebFetch trang introduction |
| Ghi chú SSR | Nằm rải trong `<hook>.md` của từng hook: "If you use this hook in an SSR context, set the `initializeWithValue` option to `false`" — ở `useMediaQuery.md:5`, `useLocalStorage.md:6`, `useSessionStorage.md:5`, `useReadLocalStorage.md:6`, `useDarkMode.md:6`, `useTernaryDarkMode.md:5`, `useScreen.md:5`, `useWindowSize.md:5` | các file `.md` cùng thư mục hook |

Lịch sử đáng biết khi so với bản cũ trong repo (`packages/usehooks-ts/CHANGELOG.md`):

- **2.11.0**: tạo `useDebounceCallback` + `useDebounceValue`, **deprecate `useDebounce`** (`add1431`); thêm option `initializeWithValue` cho các hook đọc browser (`4a9fc88`, #451); tạo `useUnmount`; bỏ hỗ trợ `Map`/`Set`/`Date` trong `use*Storage`; migrate jest → vitest.
- **2.13.0**: deprecate `useElementSize` → `useResizeObserver` (`a444ba7`). **2.14.0**: deprecate `useFetch` (`2660580`, "see documentation"), `useEffectOnce`/`useIsFirstRender`/`useUpdateEffect` (`bc3f967`). **2.15.0**: deprecate `useLockedBody` → `useScrollLock`. **2.10.0**: deprecate `useSsr`. `useImageOnLoad` deprecate ở 2.11.0 ("too opinionated").
- **3.0.0** (2024-03-08): "Remove previously deprecated hooks and hooks' signatures (#503)", "Prefer type over interface", ESM toàn workspace (`a8e8968`). **3.1.0**: thêm `remove` cho `useLocalStorage`/`useSessionStorage`. **3.1.1**: chỉ đổi peer.

## §2. Inventory — 33 hook ở `6194913`

Đường dẫn: `packages/usehooks-ts/src/<Tên>/<Tên>.ts`; mỗi thư mục còn `index.ts` (barrel), `<Tên>.md`, `<Tên>.demo.tsx`, và test nếu có. Cột "Import nội bộ" là những gì file đó `import` từ hook khác; "Dòng" là kể cả JSDoc.

| Hook | Làm gì (một dòng) | Dòng | Import nội bộ / ngoài | Test |
|---|---|---|---|---|
| `useBoolean` | `{ value, setValue, setTrue, setFalse, toggle }`; throw nếu default không phải boolean | 50 | — | `.test.ts` |
| `useClickAnyWhere` | gắn `click` lên `window` | 22 | `useEventListener` | `.test.ts` |
| `useCopyToClipboard` | `[copiedText, copy]`, `copy` resolve `false` khi không có Clipboard API | 58 | — | `.test.ts` |
| `useCountdown` | đếm xuống/lên theo `intervalMs`, `{ startCountdown, stopCountdown, resetCountdown }` | 102 | `useBoolean`, `useCounter`, `useInterval` | `.test.ts` |
| `useCounter` | `{ count, increment, decrement, reset, setCount }` | 52 | — | `.test.ts` |
| `useDarkMode` | `prefers-color-scheme` + localStorage, `{ isDarkMode, toggle, enable, disable, set }` | 92 | `useIsomorphicLayoutEffect`, `useLocalStorage`, `useMediaQuery` | `.test.ts` |
| `useDebounceCallback` | bọc `lodash.debounce`, trả hàm có `cancel`/`flush`/`isPending` | 115 | `useUnmount`; **`lodash.debounce`** | `.test.ts` |
| `useDebounceValue` | `[debouncedValue, updateDebouncedValue]` trên `useDebounceCallback` | 67 | `useDebounceCallback` | `.test.ts` |
| `useDocumentTitle` | set `document.title`, khôi phục khi unmount nếu `preserveTitleOnUnmount: false` | 43 | `useIsomorphicLayoutEffect`, `useUnmount` | `.test.ts` |
| `useEventCallback` | callback ổn định identity, đọc `fn` mới nhất qua ref; throw nếu gọi lúc render | 40 | `useIsomorphicLayoutEffect` | `.test.tsx` |
| `useEventListener` | `addEventListener` cho window / element ref / document / `MediaQueryList`, 4 overload | 121 | `useIsomorphicLayoutEffect` | `.test.ts` |
| `useHover` | boolean hover của một `RefObject<T>` | 37 | `useEventListener` | `.test.ts` |
| `useIntersectionObserver` | callback-ref + `{ isIntersecting, entry }`, `freezeOnceVisible`, `onChange` | 186 | — | **không** |
| `useInterval` | `setInterval` với callback mới nhất; `delay: null` tắt | 43 | `useIsomorphicLayoutEffect` | `.test.ts` |
| `useIsClient` | `false` → `true` sau effect đầu | 22 | — | `.test.ts` |
| `useIsMounted` | trả hàm `() => boolean` đọc ref mount | 26 | — | `.test.ts` |
| `useIsomorphicLayoutEffect` | `useLayoutEffect` trên browser, `useEffect` trên server | 17 | — | **không** |
| `useLocalStorage` | `[value, setValue, removeValue]`, serializer tuỳ chọn, sync cross-tab qua `storage` + custom event | 191 | `useEventCallback`, `useEventListener` | `.test.ts` |
| `useMap` | `Map` bất biến với `{ set, setAll, remove, reset }` | 83 | — | `.test.ts` |
| `useMediaQuery` | `matchMedia(query).matches`, option `defaultValue`/`initializeWithValue` | 83 | `useIsomorphicLayoutEffect` | **không** |
| `useOnClickOutside` | gọi handler khi event ngoài một hoặc nhiều ref | 61 | `useEventListener` | `useOnClickOuside.test.ts` (tên file thiếu chữ `t`) |
| `useReadLocalStorage` | đọc-only một key localStorage, overload SSR/CSR | 122 | `useEventListener` | `.test.ts` |
| `useResizeObserver` | `{ width, height }` của ref qua `ResizeObserver`, chọn `box` | 131 | `useIsMounted` | `.test.tsx` |
| `useScreen` | clone của `window.screen`, cập nhật khi `resize`, `debounceDelay` | 106 | `useDebounceCallback`, `useEventListener`, `useIsomorphicLayoutEffect` | **không** |
| `useScript` | chèn `<script src>`, trạng thái `idle/loading/ready/error`, cache module-level | 142 | — | `.test.ts` |
| `useScrollLock` | `overflow: hidden` + bù padding scrollbar trên `body` hoặc target | 141 | `useIsomorphicLayoutEffect` | `.test.ts` |
| `useSessionStorage` | y hệt `useLocalStorage` cho `sessionStorage` | 191 | `useEventCallback`, `useEventListener` | `.test.ts` |
| `useStep` | bước 1..`maxStep`, `goToNextStep`/`goToPrevStep`/`setStep`/`reset` | 83 | — | `.test.ts` |
| `useTernaryDarkMode` | `'system' \| 'dark' \| 'light'` trên `useLocalStorage` + `useMediaQuery` | 81 | `useLocalStorage`, `useMediaQuery` | `.test.ts` |
| `useTimeout` | `setTimeout` với callback mới nhất; `delay: null` tắt | 44 | `useIsomorphicLayoutEffect` | `.test.ts` |
| `useToggle` | `[value, toggle, setValue]` | 30 | — | `.test.ts` |
| `useUnmount` | chạy hàm khi unmount, đọc hàm mới nhất qua ref | 26 | — | `.test.ts` |
| `useWindowSize` | `{ width, height }` của `window`, overload SSR/CSR, `debounceDelay` | 100 | `useDebounceCallback`, `useEventListener`, `useIsomorphicLayoutEffect` | `.test.ts` |

Tổng 2 708 dòng (`wc -l` trên 33 file). `useSessionStorage.ts` và `useLocalStorage.ts` chỉ khác nhau ở JSDoc và tên storage — `diff` sau khi thay `sessionStorage`→`XStorage` ra **0 dòng code khác**, chỉ 4 hunk comment.

## §3. Đồ thị phụ thuộc và "tập đóng nhỏ nhất"

```text
useIsomorphicLayoutEffect  ←  useEventListener ← useHover, useClickAnyWhere, useOnClickOutside,
        ↑                          ↑               useReadLocalStorage
        │                          └── useLocalStorage / useSessionStorage (+ useEventCallback)
        ├── useEventCallback              ↑
        ├── useMediaQuery ←── useDarkMode, useTernaryDarkMode (+ useLocalStorage)
        ├── useTimeout
        ├── useInterval ←── useCountdown (+ useBoolean, useCounter)
        ├── useScrollLock
        └── useDocumentTitle (+ useUnmount)

useUnmount ← useDebounceCallback ← useDebounceValue
               ↑  (+ lodash.debounce)
               └── useWindowSize, useScreen (+ useEventListener, useIsomorphicLayoutEffect)

useIsMounted ← useResizeObserver
```

(Vẽ từ các dòng `import` của 33 file; `useEventListener.ts:5` import `useIsomorphicLayoutEffect` bằng đường đầy đủ `../useIsomorphicLayoutEffect/useIsomorphicLayoutEffect` thay vì barrel — một ngoại lệ, còn lại đều `../<Tên>`.)

| Muốn copy | Phải copy kèm (tập đóng) | Dính `lodash.debounce`? |
|---|---|---|
| Nhóm **không import gì**: `useBoolean` `useCopyToClipboard` `useCounter` `useIntersectionObserver` `useIsClient` `useIsMounted` `useIsomorphicLayoutEffect` `useMap` `useScript` `useStep` `useToggle` `useUnmount` | — | không |
| `useMediaQuery` `useTimeout` `useInterval` `useScrollLock` `useEventCallback` `useEventListener` | `useIsomorphicLayoutEffect` | không |
| `useHover` `useClickAnyWhere` `useOnClickOutside` `useReadLocalStorage` | `useEventListener` → `useIsomorphicLayoutEffect` | không |
| `useLocalStorage` / `useSessionStorage` | `useEventCallback`, `useEventListener`, `useIsomorphicLayoutEffect` | không |
| `useDarkMode` / `useTernaryDarkMode` | `useLocalStorage`, `useMediaQuery` + tập trên | không |
| `useDocumentTitle` | `useIsomorphicLayoutEffect`, `useUnmount` | không |
| `useResizeObserver` | `useIsMounted` | không |
| `useCountdown` | `useBoolean`, `useCounter`, `useInterval`, `useIsomorphicLayoutEffect` | không |
| `useDebounceCallback` | `useUnmount` | **có** (`useDebounceCallback.ts:3`) |
| `useDebounceValue` | `useDebounceCallback`, `useUnmount` | **có** |
| `useWindowSize` / `useScreen` | `useDebounceCallback`, `useUnmount`, `useEventListener`, `useIsomorphicLayoutEffect` | **có** |

## §4. Từng hook có đáng copy không — đối chiếu rule của repo

### 4.1 Bảng đánh giá

Bốn cờ: **(a)** anti-pattern theo `.agents/rules/` · **(b)** trùng thứ repo đã có · **(c)** SSR-hostile (quan trọng vì `packages/ui` được app Next và React Router dùng — `reactrouter-server-modules.md`: "Everything else an app reaches under `src/` is compiled into **both** graphs") · **(d)** coupling nội bộ (xem §3). Cột "Gate" là lỗi thật khi chạy `tsc`/`biome` của repo trên file upstream (§4.2). Số dòng trích là của file upstream nguyên bản (có JSDoc).

| Hook | (a) | (b) | (c) | (d) | Gate | Ghi chú kèm dẫn chứng |
|---|---|---|---|---|---|---|
| `useIsomorphicLayoutEffect` | — | **đã có, nguyên văn** | an toàn | — | sạch | `packages/hook/src/use-isomorphic-layout-effect.ts` = upstream, 0 dòng khác |
| `useCopyToClipboard` | — | **đã có, nguyên văn** | `navigator` chỉ đọc trong callback | — | sạch | khác 1 dòng (`async text =>` vs `async (text) =>`) |
| `useMediaQuery` | — | **đã có, nguyên văn** | `initializeWithValue = true` mặc định đọc `matchMedia` trong initializer → server trả `defaultValue`, client render đầu trả giá trị thật → hydration mismatch; upstream tự ghi "In SSR… set `initializeWithValue` to `false`" (`useMediaQuery.md:5`) | `useIsomorphicLayoutEffect` | sạch | Consumer là `packages/ui/src/components/sidebar.tsx:10` qua `useIsMobile`, tức chạy trong Next/RR. Hướng react.dev đưa cho "value exposed by the browser that changes over time" là `useSyncExternalStore` với `getServerSnapshot` ("runs on the server when generating the HTML, and… on the client during hydration") — một câu hỏi mở, không phải việc copy |
| `useDebounceValue` | **(a)** gọi `updateDebouncedValue(...)` và ghi `previousValueRef.current` **trong render** (`useDebounceValue.ts:61-64`) — trái react.dev `useRef` "Do not write _or read_ `ref.current` during rendering" và rule `components-and-hooks-must-be-pure` "side effects should not run in render"; API `[value, setter]` khác `useDebounce(value, delay)` mà 2 file trong `apps/documents` đang gọi | thay `use-debounce` hiện tại | — | `useDebounceCallback` → **lodash** | TS2554 ở dep | Bản `use-debounce.ts` hiện tại **trùng hình dạng** với `useDebounce` v2 đã deprecate (`useDebounce/useDebounce.ts` @ tag `usehooks-ts@2.16.0`, khác 3 dòng: tên biến `timer`/`handler`, `delay ?? 500`) — nhưng đây cũng là snippet phổ biến, **không khẳng định được là copy** |
| `useDebounceCallback` | **(a)** rule `patterns-debounce-search-input.md:80`: "value form only; there is no `useDebouncedCallback` on web, so debounce the value rather than the callback"; `wrappedFunc.isPending` đọc ref chứ không hỏi lodash (`:98-100`) | — | — | `useUnmount` + **`lodash.debounce`** (`:3`) | **TS2554** `useRef<…>()` không đối số (`:79`); Biome `noExplicitAny` ×2 (`:45`, `:74`) | Shell `hook-public/package.json` không có `dependencies`; thêm lodash là thêm một dependency literal vào shell và vào `ui-public` (xem §7.3) |
| `useWindowSize` / `useScreen` | — | RR Template đã có `footer-viewport-size.tsx` viết tay theo đúng khuôn "null until an effect runs" (`reactrouter-server-modules.md`) | có overload SSR (`initializeWithValue: false`), `IS_SERVER` ép `false` trên server (`useWindowSize.ts:24-26` bản strip) | **lodash** bắc cầu qua `useDebounceCallback` | `useScreen` không có test | `useScreen` trả bản clone `window.screen` (#280) |
| `useUnmount` | **(a)** `funcRef.current = func` **trong render** (`useUnmount.ts:18`) | — | — | — | sạch | Sửa thành ghi trong effect là hết trái rule, nhưng thành bản fork |
| `useEventCallback` | **(a)** mục đích của nó — "separate events from Effects" — React 19.2 đã có `useEffectEvent` (react.dev blog 2025-10-01, "React 19.2"); repo dùng `react` 19.2.8 (`package.json` catalog `react19`). Cho event handler thường thì React Compiler đã memo, không cần identity ổn định thủ công | — | — | `useIsomorphicLayoutEffect` | Biome `useExhaustiveDependencies` + `noUnnecessaryConditions` (`:37`) | `useEffectEvent` "can only be called from inside Effects… Do not… pass them to other components or Hooks" — nên nó **không** thay được `useEventCallback` ở chỗ upstream dùng làm setter trả ra ngoài (`useLocalStorage.ts:97` bản strip) |
| `useEventListener` | — | — | `element?.current ?? window` đọc trong `useEffect` — an toàn | `useIsomorphicLayoutEffect` | Biome `useOptionalChain` (`:105`); **call site React 19: TS2769** | deps `[eventName, element, options]` (`:118`): caller truyền `{ capture: true }` inline là gỡ/gắn listener mỗi render. Là gốc của 7 hook khác |
| `useHover`, `useClickAnyWhere`, `useOnClickOutside` | — | Base UI đã tự xử lý click-outside cho Popover/Dialog/Menu — **chưa xác minh** ở mức source Base UI, chỉ suy từ việc `@monorepo/ui` không cần hook này | an toàn (qua `useEventListener`) | `useEventListener` | **call site React 19: TS2345** (`useHover`, `useOnClickOutside`) | `useOnClickOutside` nhận mảng ref, `focusin`/`focusout` (3.0.2) |
| `useLocalStorage` / `useSessionStorage` / `useReadLocalStorage` | **(a)** `useEffect(() => { setStoredValue(readValue()) }, [key])` (`useLocalStorage.ts:168-171`, `useSessionStorage.ts:168`, `useReadLocalStorage.ts:99`) — set state trong effect ngay khi mount, lint `set-state-in-effect`; `useCallback(…, [options])` với `options = {}` mặc định → identity đổi mỗi render | `apps/documents` và `apps/portfolio` đã có `theme-provider.tsx` tự đọc/ghi `localStorage` + `matchMedia` (documents `:19,25,52`) | `initializeWithValue = true` mặc định → cùng hydration mismatch như `useMediaQuery`; upstream ghi ở `useLocalStorage.md:6` | `useEventCallback`, `useEventListener` | Biome `useExhaustiveDependencies` ×2 mỗi file | Sync cross-tab bằng `StorageEvent('local-storage')` là tính năng thật, khó tự viết ngắn. Hai file local/session trùng code 100% → nếu copy, hợp thành một hàm nhận `Storage` là hợp `quality-simplicity` hơn |
| `useDarkMode` / `useTernaryDarkMode` | **(a)** `useIsomorphicLayoutEffect(() => { if (isDarkOS !== isDarkMode) setDarkMode(isDarkOS) }, [isDarkOS])` (`useDarkMode.ts:69-73`) — derive state trong effect (`react-effects-sync-only.md`); key localStorage mặc định `usehooks-ts-dark-mode` | hai app đã có theme provider riêng (CLAUDE.md §1: "a context, an effect and one `localStorage` key, no store") | kế thừa (c) của `useMediaQuery` + `useLocalStorage` | 5 file | `useTernaryDarkMode.ts:71` **TS2322** (`modes[nextIndex]` có thể `undefined` dưới `noUncheckedIndexedAccess`) | — |
| `useIntersectionObserver` | **(a)** `callbackRef.current = onChange` trong render (`:99`); `JSON.stringify(threshold)` trong deps (`:151`) | thay `use-on-screen` cũ (API khác: callback ref thay vì `RefObject`) | `'IntersectionObserver' in window` chỉ trong effect — an toàn | — | **TS2554** (`:97` `useRef<…>()`); Biome `useExhaustiveDependencies` | không có test upstream. Rule `tanstack-consume-infinite.md` cho sentinel infinite-scroll đang dùng `IntersectionObserver` tay trong `useEffect` — đây là consumer tự nhiên nếu copy |
| `useResizeObserver` | **(a)** `onResize.current = options.onResize` trong render (`:62`) | — | `typeof window === 'undefined'` guard trong effect — an toàn | `useIsMounted` | **TS2345 ×2** (`:77-78`, `[entry]` destructure dưới `noUncheckedIndexedAccess`); có `// @ts-ignore`; **call site React 19: TS2322** | `useIsMounted` chỉ dùng để chặn `setSize` sau unmount — React 18+ không còn warn việc đó, giá trị thấp |
| `useIsClient` | **(a)** `useState(false)` + `useEffect(() => setClient(true))` — chính là "mounted flag" mà `reactrouter-server-modules.md` bảo không dùng: "there is no `mounted` flag, the first `setState` *is* the mount signal" | — | — | — | sạch | Bản cũ `use-is-client.ts` (1c9eaa1^) cùng hình dạng |
| `useIsMounted` | (a) mềm: pattern chặn setState-after-unmount không còn cần từ React 18 | — | — | — | sạch | chỉ `useResizeObserver` dùng |
| `useTimeout` / `useInterval` | — | `header-clock.tsx` ở Vite và RR Template đang `setInterval` tay | an toàn | `useIsomorphicLayoutEffect` | sạch | Bản cũ `use-timeout.ts` là bản gần-copy của upstream nhưng dùng `useEffect` thay layout effect (§5) |
| `useCountdown` | — | `useCounter`+`useBoolean`+`useInterval` — API khác hẳn `use-countdown` cũ (`{ countStart, intervalMs, isIncrement, countStop }` vs `(initialSeconds)`) | an toàn | 4 file | sạch | — |
| `useDocumentTitle` | — | React 19 hỗ trợ `<title>` render trong component ("Support for Document Metadata", react.dev blog 2024-12-05); Next có Metadata API; RR có `meta` | `window.document.title` trong layout effect — an toàn | `useIsomorphicLayoutEffect`, `useUnmount` | sạch | — |
| `useScript` | — | Next có `next/script` (chưa xác minh chi tiết API ở note này) | `typeof window === 'undefined'` → `'loading'` | — | sạch | `cachedScriptStatuses` là `Map` module-level: trên server Node là state dùng chung giữa request — cùng lớp vấn đề mà `getQueryClient()` factory của Next/RR Template tránh |
| `useScrollLock` | — | Base UI Dialog/Sheet tự lock scroll — **chưa xác minh** | `IS_SERVER` guard, chạy trong layout effect | `useIsomorphicLayoutEffect` | Biome `noUnnecessaryConditions` ×3 | — |
| `useBoolean` `useCounter` `useToggle` `useStep` `useMap` | — | mỗi cái là 1–3 dòng `useState`; `useMap.ts:54` `useState(new Map(initialState))` tạo Map mỗi render (không lazy) | — | — | sạch | Không vi phạm rule nào; giá trị nằm ở "một thư viện hook công bố thì thường có" chứ không ở app nào trong repo cần |

### 4.2 Bằng chứng Gate — chạy thật trên 33 file

Cách chạy: copy 33 file vào scratchpad, đổi `../useX` → `./useX`, stub `declare module 'lodash.debounce'`, `tsconfig` `extends` `tooling/typescript/base.json` (`strict`, `noUncheckedIndexedAccess`, `module: Preserve`) với `lib` `dom`, trỏ `typeRoots`/`paths` vào `packages/hook/node_modules/@types/react` **19.2.18**, chạy `packages/hook/node_modules/.bin/tsc` (7.0.2). Kết quả **5 lỗi**:

```text
useDebounceCallback.ts(79,25): error TS2554: Expected 1 arguments, but got 0.
useIntersectionObserver.ts(97,23): error TS2554: Expected 1 arguments, but got 0.
useResizeObserver.ts(77,36): error TS2345: Argument of type 'ResizeObserverEntry | undefined' is not assignable …
useResizeObserver.ts(78,37): error TS2345: (như trên)
useTernaryDarkMode.ts(71,7): error TS2322: Type 'TernaryDarkMode | undefined' is not assignable to type 'TernaryDarkMode'.
```

Hai lỗi TS2554 là thay đổi có tài liệu của React 19: "We've changed the types so that `useRef` now requires an argument" (react.dev, React 19 Upgrade Guide § TypeScript changes, codemod `refobject-defaults`). Ba lỗi còn lại là `noUncheckedIndexedAccess` của repo, upstream không bật.

Thêm một file call-site kiểu React 19 rồi chạy lại — **4 lỗi nữa**, đều ở hook nhận `RefObject<T>`:

```text
useEventListener('click', () => {}, useRef<HTMLButtonElement>(null))   → TS2769 No overload matches this call
useHover(divRef)               → TS2345 'RefObject<HTMLDivElement | null>' is not assignable to 'RefObject<HTMLElement>'
useOnClickOutside(divRef, …)   → TS2345 (như trên)
useResizeObserver({ ref: divRef }) → TS2322 (như trên)
```

Nguyên nhân là câu tiếp theo trong cùng guide: "`MutableRef` is now deprecated in favor of a single `RefObject` type… `useRef<T>(null)`… automatically returns `RefObject<T | null>`" — còn upstream khai `RefObject<T>` với `T extends HTMLElement` (`useHover.ts`, `useOnClickOutside.ts`, `useResizeObserver.ts`, `useEventListener.ts:34`). Đây chính là issue #663 và PR #680/#724 đang mở ở upstream.

`biome lint` của repo (config root, tạm copy vào `packages/hook/` rồi xoá, `git status` sạch): **9 error, 10 warning**, không tính format (upstream dùng nháy đơn, không chấm phẩy — `check:fix` lo được). Phân bố: `useExhaustiveDependencies` ở `useLocalStorage:168`, `useSessionStorage:168`, `useReadLocalStorage:99`, `useIntersectionObserver:103`, `useEventCallback:37`; `noUnnecessaryConditions` ở `useScrollLock` ×3, `useResizeObserver:89`, `useEventCallback:37`, `useDarkMode:66`; `useOptionalChain` ở `useOnClickOutside:44`, `useEventListener:105`; `noExplicitAny` ở `useDebounceCallback:45,74`.

## §5. So với 14 hook cũ (`1c9eaa1^`) và 5 hook hiện tại

`git show 1c9eaa1^:packages/hook/src/hooks/<name>.ts` (bản cũ có barrel `src/index.ts`, `exports: { ".": "./src/index.ts" }`, build bằng rslib + `scripts/copy-dist.js`). So bằng `diff` sau khi chuẩn hoá nháy/chấm phẩy/thụt đầu dòng và bỏ JSDoc.

| Hook cũ | Quan hệ với usehooks-ts | Bản hiện tại (5 hook, `b0567be`) |
|---|---|---|
| `use-copy-to-clipboard` | Viết lại đơn giản: `copy` trả `Promise<void>`, không `useCallback`, `console.log("Error")` — 23 dòng khác upstream | **= upstream 3.1.1 nguyên văn** (1 dòng khác) |
| `use-countdown` | Tự viết: `(initialSeconds) → [timeLeft, reset]`, interval phụ thuộc `timeLeft` (tạo lại mỗi giây) | bỏ |
| `use-debounce` | **= `useDebounce` v2.x** (deprecate 2.11.0, xoá 3.0.0) về hình dạng — 3 dòng khác; không có đối chứng nào nói bản cũ chép từ đâu | giữ nguyên (`use-debounce.ts`, 17 dòng); thay thế ở v3 là `useDebounceValue` với API khác |
| `use-fetch` | Tự viết 29 dòng (`useState`×3 + `useEffect`); upstream `useFetch` v2 là `useReducer` + cache, deprecate 2.14.0 "see documentation" | bỏ — đúng: `react-effects-sync-only.md` "fetching in an effect → no cache, no dedupe, races", TanStack Query là chủ |
| `use-hover` | Cùng API (`RefObject → boolean`) nhưng tự gắn listener trong `useEffect`; upstream đi qua `useEventListener` | bỏ |
| `use-is-client` | Cùng hình dạng `useIsClient` upstream | bỏ |
| `use-is-mobile` | Là hook `use-mobile` shadcn sinh ra (`useState<boolean \| undefined>`, `window.innerWidth < 768` trong effect) — **không** phải usehooks-ts | viết lại trên `useMediaQuery` + `MOBILE_BREAKPOINT` export |
| `use-isomorphic-layout-effect` | **Lỗi**: là *hàm trả về* hook (`export function useIsomorphicLayoutEffect() { return … }`), caller phải gọi hai lần | **= upstream nguyên văn** |
| `use-local-storage` | Tự viết 30 dòng: đọc `window.localStorage` trong initializer **không guard** (crash SSR), không sync tab, không `remove` | bỏ |
| `use-media-query` | Tự viết: `useState(false)` + `useEffect`, không option SSR | **= upstream nguyên văn** (4 dòng khác: đường import, `interface`) |
| `use-network-status` | Tự viết, **có bug**: `const isServer = typeof window !== "undefined"` (ngược dấu) → trên browser luôn khởi tạo `true`. usehooks-ts v3 **không có** hook online-status; react.dev dùng đúng case này làm ví dụ `useSyncExternalStore` (`navigator.onLine`, `online`/`offline`) | bỏ |
| `use-on-screen` | `RefObject` + `rootMargin` → boolean; thay thế upstream là `useIntersectionObserver` (callback ref, `threshold`, `freezeOnceVisible`) | bỏ |
| `use-throttle` | **Bug**: body giống hệt `use-debounce` (không throttle gì). usehooks-ts không có throttle | bỏ |
| `use-timeout` | Gần-copy `useTimeout` upstream: khác ở `useEffect` thay `useIsomorphicLayoutEffect` để lưu callback, tên biến, hai dòng comment | bỏ |

Kết luận của bảng: **ba bản copy nguyên văn upstream trong repo hiện tại** (`use-media-query`, `use-copy-to-clipboard`, `use-isomorphic-layout-effect`) đều xuất hiện ở `b0567be` (2026-09-03, "add the six source-only packages") chứ không phải từ bản cũ; bản cũ chủ yếu tự viết và có ít nhất ba lỗi thật (`use-isomorphic-layout-effect`, `use-network-status`, `use-throttle`).

## §6. Licensing — MIT yêu cầu gì khi copy source

Văn bản gốc (`LICENSE` @ `6194913`):

> The MIT License (MIT)
> Copyright (c) 2020 Julien CARON
> […] **The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.**

Hai điều kiện: giữ **dòng copyright** và giữ **đoạn permission notice** (cả đoạn "Permission is hereby granted… THE SOFTWARE IS PROVIDED "AS IS"…") trong "all copies or substantial portions". Copy nguyên một file hook là "substantial portion". Không có yêu cầu nào về việc phải giữ tên gốc, giữ JSDoc, hay báo cho tác giả. Một header SPDX một dòng **không** thay được permission notice — nó chỉ tiện cho tool nhận diện; nội dung notice vẫn phải có ở đâu đó trong bản phân phối. (Đây là đọc trực tiếp văn bản license; note không đưa ý kiến pháp lý.)

Bản phân phối ở đây là **hai**: tarball `@fe-monorepo/hook` (`packages/hook-public`) và — vì §7.3 — tarball `@fe-monorepo/ui` (`ui-public/dist/internal/`). Repo GitHub công khai là bản thứ ba.

Cơ chế đề xuất để grill chọn, xếp theo lượng file phải sửa:

1. **Một file `packages/hook/LICENSE-usehooks-ts`** chứa nguyên văn `LICENSE` upstream + một dòng đầu ghi "Applies to files marked `Derived from usehooks-ts` in `src/`". Thêm `"LICENSE-usehooks-ts"` vào `files` của `packages/hook-public/package.json` (hiện là `["dist", "README.md", "CHANGELOG.md"]`) và của `ui-public` nếu vẫn vendor. `npm pack` chỉ mang những gì `files` liệt kê — thiếu dòng này là tarball không có notice.
2. **Header 2–3 dòng ở đầu mỗi file copy**: `// Derived from usehooks-ts <hook>.ts @ <sha7> (v3.1.1), MIT © 2020 Julien CARON — see LICENSE-usehooks-ts`. Header này cũng là metadata re-sync (§7.4). Rule `quality-code-comments.md` cho phép comment "why" — nguồn gốc và license là "why".
3. **README của shell** (`packages/hook-public/README.md`, hiện chỉ có "## License — MIT"): thêm mục "Third-party notices" nêu usehooks-ts, link repo, license. README consumer là chỗ người cài package đọc trước khi mở `node_modules`.
4. Riêng `ui-public`: nếu hook copy vẫn bị compile vào `dist/internal/`, README và `files` của `ui-public` cũng phải mang notice. Hoặc thu hẹp glob ở `packages/ui/rslib.config.ts:68` (xem §7.3).

Nợ đang có: ba file ở §5 đã là bản copy từ `b0567be` mà `hook-public` 2.0.0 (README của shell nói "2.0.0 is a rewrite"; đã publish lên registry hay chưa — **chưa xác minh**) không kèm notice. Đây là việc cần làm **bất kể** grill quyết định copy thêm hay không.

## §7. Cơ chế "copy tay" trong repo này

### 7.1 Tên file, export, barrel

- Upstream: thư mục camelCase `useFoo/useFoo.ts` + `index.ts` barrel mỗi thư mục + `src/index.ts` barrel tổng (33 dòng `export * from './useX'`). Package `exports` chỉ có `.` — consumer import barrel.
- Repo: flat kebab-case `packages/hook/src/use-foo.ts`, **không** barrel (`quality-avoid-barrel-imports.md`: "This repo authors **no** `index.ts`/`index.tsx` barrels anywhere"), `exports: { "./*": "./src/*.ts" }` (`packages/hook/package.json`) nên `@monorepo/hook/use-foo` resolve thẳng file. Shell: `"./*": { "types": "./dist/*.d.ts", "import": "./dist/*.js" }`.
- Việc phải làm mỗi file: đổi tên `useFoo.ts` → `use-foo.ts`; đổi mọi `from '../useX'` (và `'../useIsomorphicLayoutEffect/useIsomorphicLayoutEffect'` ở `useEventListener.ts:5`) thành `from "./use-x"`; bỏ `index.ts`; giữ `export function useFoo` (named export — đúng bảng `quality-imports.md`: hook là named). `type` alias upstream đã là `type` (3.0.0 "Prefer type over interface"), còn `use-media-query.ts` hiện tại đã đổi ngược thành `interface` — một chỗ hai bản đang lệch.
- `use-is-mobile.ts` hiện `export const MOBILE_BREAKPOINT` bên cạnh hook — tiền lệ cho một file export thêm hằng.

### 7.2 Build: rslib bundleless đã rewrite specifier

`packages/hook/rslib.config.ts`: `bundle: false`, `format: "esm"`, `entry: { index: ["./src/**/*.ts"] }`, `dts: true`, `distPath.root: "../hook-public/dist"`, `cleanDistPath: true`. Chính comment trong file nói "bundleless ESM is what rewrites the two relative imports… to carry the `.js` extension ESM requires", và output thật xác nhận: `packages/hook-public/dist/use-media-query.js:2` là `import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";`, `use-is-mobile.js:1` là `from "./use-media-query.js"`. Vậy import nội bộ giữa các hook copy vào **chỉ cần** viết `./use-x` (không đuôi), rslib lo phần còn lại. Vì glob là `src/**/*.ts`, một file `.d.ts` stub (ví dụ cho lodash) đặt trong `src/` cũng thành entry — đừng để ở đó.

`scripts/publish-smoke.ts` + `scripts/lib/consumer-smoke.ts` kiểm gì cho shell hook: `package.json` cài vào không chứa `catalog:`/`workspace:` (`FORBIDDEN_IN_MANIFEST`), `dist/` tồn tại, không có specifier `@monorepo/`/`#` trong dist (`FORBIDDEN_IN_DIST` + `forbiddenInDist: []` cho hook), rồi consumer Vite + React 19 `tsc --noEmit` và `vite build` với đúng **một** import `@fe-monorepo/hook/use-debounce` (`consumer-smoke.ts:64-67`). Nghĩa là: một hook copy vào có lỗi type chỉ lộ ở Gate `typecheck` của `packages/hook`, còn smoke chỉ chứng minh `use-debounce`; và nếu thêm `lodash.debounce` mà quên khai `dependencies` literal trong shell, smoke **có** bắt được (consumer `tsc` không resolve được module).

### 7.3 Hai nơi khác tự động "mang theo" mọi file trong `packages/hook/src/`

- `packages/ui/rslib.config.ts:63-69`: lib thứ hai `entry: { internal: ["../hook/src/*.ts"] }` compile **toàn bộ** hook package vào `ui-public/dist/internal/` để `sidebar.js` import `../internal/use-is-mobile.js` (`:53`). Comment giải thích: chọn cả package thay vì 3 file để không "emit a dangling `./use-media-query.js` the day the import graph moves", và "Five files come to 2.6 kB". Copy thêm 28 hook là `ui-public` mang thêm ~2 700 dòng dead code (không reachable từ `exports` của shell), mang thêm nghĩa vụ notice (§6), và **nếu có `lodash.debounce`** thì `ui-public` phải khai dependency đó hoặc `output.externals` phải xử lý — `scripts/build.ts` `assertRelativeImportsResolve` chỉ kiểm specifier tương đối. Glob là `*.ts` một cấp, nên một cách tách là để hook không-cho-ui vào thư mục con — nhưng `exports: "./*"` của hook package cũng là một cấp, sẽ đổi đường import. Câu hỏi mở.
- `apps/documents/scripts/docs-metadata.ts:227-228`: `readdirSync(directoryPath).filter((fileName) => fileName.endsWith(source.extension))` trên `packages/hook/src` — **mỗi file `.ts` thêm vào là một trang** `/hooks/<slug>` trên site docs (CLAUDE.md §1 `apps/documents`), chạy ở `predev`/`prebuild`/`pretypecheck`/`pretest`. Test `test/generated/catalogue-invariants.test.ts` của app đó có thể có bất biến về số lượng/slug — **chưa xác minh** nội dung test.

### 7.4 Giữ cho re-sync được

usehooks-ts tag mỗi release (`usehooks-ts@3.1.1` → `6194913`); `raw.githubusercontent.com/juliencrn/usehooks-ts/<sha>/packages/usehooks-ts/src/<Hook>/<Hook>.ts` là URL ổn định. Ghi vào header mỗi file: tên hook upstream, **SHA đầy đủ hoặc tag**, version. Có SHA thì re-sync là `diff` file cũ với file mới ở SHA mới sau khi chuẩn hoá format — đúng cách §5 đã so. Nhưng lưu ý: mọi sửa để qua Gate (§4.2: `useRef(undefined)`, `RefObject<T | null>`, ref-in-render, deps Biome) làm file **không còn nguyên văn**; re-sync khi đó là merge tay, không phải copy đè. Với upstream đứng yên 19 tháng và các PR React 19 chưa merge, lượng re-sync thực tế có thể là 0 — cũng là câu hỏi mở.

### 7.5 Test

Upstream: `vitest ^1.3.1`, `environment: 'jsdom'`, `globals: true`, `setupFiles: './tests/setup.ts'` (`expect.extend(jest-dom matchers)` + `afterEach(cleanup)`), test dùng `renderHook`/`act` từ `@testing-library/react` và `vitest.useFakeTimers()` (`useDebounceValue.test.ts:1-6`). 29/33 hook có test; thiếu `useIntersectionObserver`, `useIsomorphicLayoutEffect`, `useMediaQuery`, `useScreen`; hai file là `.test.tsx` (`useEventCallback`, `useResizeObserver`); một file sai tên `useOnClickOuside.test.ts`.

Repo: `packages/hook` không có script `test` (CLAUDE.md §1 nói rõ; `package.json` chỉ có `build`/`clean`/`typecheck`). Khuôn có sẵn để chép là `packages/i18n`: `vitest.config.ts` với `process.env.TZ = "UTC"` ở module scope, `environment: "jsdom"`, `include: ["test/**/*.{test,spec}.{ts,tsx}"]`, `clearMocks: true`; `package.json` thêm `test`/`test:watch` và devDeps `vitest`, `jsdom`, `@testing-library/react` từ `catalog:testing` (root `package.json` catalog `testing`: vitest `^5.0.0`, jsdom `^30.0.1`, `@testing-library/react` `^16.3.3`, jest-dom `^7.0.1`). Khác biệt phải xử lý khi mang test sang: (1) repo không bật `globals` ở package (chỉ `apps/_template_vite/vitest.config.ts:18` bật) → thêm `import { describe, it, expect, vi } from "vitest"` và đổi `vitest.useFakeTimers()` → `vi.useFakeTimers()`, hoặc bật `globals`; (2) test nằm ở `packages/hook/test/use-foo.test.ts` soi gương `src/` (`testing-coverage.md`), không nằm cạnh source như upstream; (3) test của hook nhận ref sẽ vấp cùng lỗi `RefObject<T | null>` ở §4.2 cho tới khi sửa kiểu; (4) `apps/documents` glob `*.ts` trong `packages/hook/src` — thêm một lý do để test **không** ở trong `src/`.

## §8. Câu hỏi mở cho grill

- **Mục tiêu của `@fe-monorepo/hook` là gì?** "Hook mà app trong repo dùng" (hiện 3 hook có consumer: `use-debounce` ×2, `use-copy-to-clipboard` ×2 trong `apps/documents`, `use-is-mobile` ×1 trong `packages/ui`) hay "một thư viện hook công bố có bề mặt rộng"? Câu này quyết định có copy `useBoolean`/`useCounter`/`useToggle`/`useStep`/`useMap` không, vì chúng không vi phạm gì nhưng cũng không ai trong repo gọi.
- **`lodash.debounce`: nhận, viết lại, hay bỏ cả bốn hook?** Nhận = shell (và có thể `ui-public`) có `dependencies` đầu tiên + đảo rule `patterns-debounce-search-input.md:80`. Viết lại = `useDebounceCallback` không còn là bản copy. Bỏ = giữ `use-debounce` hiện tại (hình dạng v2 đã deprecate) và không có `useWindowSize`/`useScreen`.
- **Copy "nguyên văn rồi vá" hay "copy làm mẫu rồi viết theo rule"?** §4.2 cho thấy nguyên văn không qua Gate; vá xong thì re-sync là merge tay. Nếu đã phải viết lại `RefObject<T | null>`, `useRef(undefined)`, bỏ ref-in-render — có còn lý do để gọi nó là copy (và mang nghĩa vụ notice) thay vì "inspired by"? Ranh giới "substantial portion" của MIT nằm ở đâu là câu grill phải chốt.
- **`useMediaQuery` (và `use-is-mobile` mà `sidebar.tsx` dùng trong Next/RR) có nên đổi sang `useSyncExternalStore` + `getServerSnapshot`?** Đây là hook có consumer SSR thật; upstream bảo caller tự nhớ `initializeWithValue: false`. Không thuộc phạm vi copy nhưng là hook duy nhất có rủi ro hydration đang chạy.
- **`ui-public` có tiếp tục vendor cả `packages/hook/src/*.ts` không?** Thu hẹp glob về đúng 3 file (đổi comment ở `rslib.config.ts:63-67`), tách thư mục, hay chấp nhận dead code + notice kép.
- **`apps/documents` có muốn tự động có trang cho mọi hook copy vào không?** Nếu có, mỗi hook cần JSDoc/summary theo format generator đọc (**chưa xác minh** generator lấy mô tả từ đâu); nếu không, cần một cách loại trừ.
- **Attribution cho ba file đã copy ở `b0567be`** làm ngay trong ticket riêng (nợ hiện hữu, độc lập với quyết định copy thêm) hay gộp?
- **Có mang test upstream không, và bật `globals` hay không?** 29 test có sẵn là lý do mạnh để `packages/hook` có script `test` lần đầu; nhưng chúng cũng là code MIT (cùng notice) và một số sẽ đỏ vì kiểu React 19.
- **Hook nào trong nhóm "sửa rồi mới copy" đáng công?** Ứng viên có consumer tự nhiên trong repo: `useIntersectionObserver` (sentinel infinite-scroll ở `tanstack-consume-infinite.md` đang viết tay), `useInterval`/`useTimeout` (hai `header-clock.tsx` đang `setInterval` tay), `useEventListener` (gốc của 7 hook). Còn lại (`useScript`, `useScrollLock`, `useDocumentTitle`, `useDarkMode`×2, `use*Storage`) đều có thứ thay thế trong framework hoặc trong app.
