# @fe-monorepo/hook

Five generic React hooks, published from the [`monorepo`](https://github.com/qtuan02/monorepo)
workspace as ESM with per-file type declarations. No barrel, no root entry — you import the
hook you need by its own subpath, so a bundler ships only that file.

> `2.0.0` is a rewrite, not an upgrade. The `1.0.0` line published 14 hooks from the
> pre-Skeleton codebase; this line publishes the five that the current apps actually use.
> Nothing carries over — treat it as a new package.

## Install

```bash
bun add @fe-monorepo/hook
# npm install @fe-monorepo/hook
```

### Peer dependencies

| Peer | Range |
| --- | --- |
| `react` | `>=19` |
| `react-dom` | `>=19` |

The package is ESM-only (`"type": "module"`) and ships no CommonJS build.

## Usage

Every hook lives at its own subpath, named after its file:

```tsx
import { useDebounce } from "@fe-monorepo/hook/use-debounce";

function SearchBox() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  // …filter or fetch on `debouncedSearch`, bind the input to `search`
}
```

There is no `import { useDebounce } from "@fe-monorepo/hook"` — the root entry does not exist.

Every hook carries a usage example in the `@example` of its JSDoc — hover it in your editor, or
open the hook's page on the workspace's docs site (`apps/documents` in the repository above).

## Hooks

| Subpath | Export | What it does |
| --- | --- | --- |
| `@fe-monorepo/hook/use-debounce` | `useDebounce(value, delay)` | Returns `value` again `delay`ms after it last changed. |
| `@fe-monorepo/hook/use-media-query` | `useMediaQuery(query)` | Subscribes to a CSS media query. Renders `false` on the first frame (server and client alike) and reads `matchMedia` in an effect, so it never hydration-mismatches. |
| `@fe-monorepo/hook/use-is-mobile` | `useIsMobile()`, `MOBILE_BREAKPOINT` | `useMediaQuery` pinned to Tailwind's `md` breakpoint (768px). |
| `@fe-monorepo/hook/use-copy-to-clipboard` | `useCopyToClipboard()` | `[copiedText, copy]`; `copy(text)` resolves `void` — `copiedText` is `text` after a successful copy, `null` after a failed one, and the hook only warns when the Clipboard API is unavailable. |
| `@fe-monorepo/hook/use-isomorphic-layout-effect` | `useIsomorphicLayoutEffect` | `useLayoutEffect` in the browser, `useEffect` on the server. |

## TypeScript

Each subpath resolves its own `.d.ts`, so `moduleResolution: "Bundler"` (or `"NodeNext"`) picks
up types with no `paths` entry and no `@types/*` package.

## License

MIT

## Third-party notices

Four of the five hooks are derived from [hooks-ts](https://github.com/michal-worwag/hooks-ts)
(`hooks-ts@0.12.0`, MIT © 2024 Michał Worwąg): `use-debounce`, `use-media-query`,
`use-copy-to-clipboard` and `use-isomorphic-layout-effect`. Each of those source files
opens with a `Derived from hooks-ts` line naming the upstream file and commit, and the
upstream license ships in this package as [`LICENSE-hooks-ts`](./LICENSE-hooks-ts).
`use-is-mobile` is this workspace's own.
