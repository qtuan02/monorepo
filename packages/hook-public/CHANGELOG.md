# @fe-monorepo/hook

## 1.0.1

> Version number chosen by hand rather than computed from the changeset below (a breaking rewrite
> would ordinarily be a major bump — `2.0.0`). The change itself is exactly what the changeset
> describes.

### Changes

- Rewritten from scratch — not an upgrade of `1.0.0` (the only version previously on npm). The
  package now has 18 hooks: 17 **Derived** from
  [hooks-ts](https://github.com/michal-worwag/hooks-ts) 0.12.0 (MIT © 2024 Michał Worwąg) —
  `use-boolean`, `use-copy-to-clipboard`, `use-countdown`, `use-counter`, `use-dark-mode`,
  `use-debounce`, `use-hover`, `use-isomorphic-layout-effect`, `use-local-storage`,
  `use-media-query`, `use-network-status`, `use-on-screen`, `use-previous`, `use-session-storage`,
  `use-throttle`, `use-timeout`, `use-toggle` — plus `use-is-mobile`, a hook of this workspace's
  own. Every Derived hook opens with a `Derived from hooks-ts …` line naming its source file and
  commit; the tarball now carries `LICENSE-hooks-ts` and the README has a "Third-party notices"
  section.

  - **Breaking:** `useCopyToClipboard()` — `copy(text)` now returns `Promise<void>` instead of
    `Promise<boolean>`; read `copiedText` (which is `text` on success, `null` on failure) instead
    of the return value.
  - **Breaking:** `useMediaQuery(query)` no longer takes an options parameter (`defaultValue` /
    `initializeWithValue`); the hook renders `false` on the first frame on both server and client
    and reads `matchMedia` inside an effect, so there is no more hydration mismatch, but it is also
    no longer correct on the very first browser frame.

  Four hooks were patched to work on the server: `useLocalStorage`/`useSessionStorage`/`useDarkMode`
  no longer throw when there is no `window`, and `useNetworkStatus` fixes an inverted `isServer`
  check from upstream. `useThrottle` is now a real throttle (upstream is a debounce mislabeled as
  one), `usePrevious` writes the previous value into `useState` instead of a ref during render (so
  the React Compiler no longer drops the memoization), and `useDarkMode` takes new options
  (`{ storageKey, className, target }`).

  `1.0.0` shipped 11 hooks copied from hooks-ts with no MIT notice at all; this is the first release
  that carries that obligation correctly.
