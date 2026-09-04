import { existsSync } from "node:fs";

/**
 * Fails `ui-add` when the shadcn CLI has scaffolded a hook into this package.
 *
 * `components.json` points its `hooks` alias at `#hooks` — mapped to
 * `./src/hooks/*.ts`, a directory that deliberately does not exist. The alias is
 * a landing pad, not a home: CLI 4.20.x validates every alias before it runs and
 * cannot resolve one aimed at `@monorepo/hook`, whose exports are subpath-only,
 * so an alias inside this package is the only shape that lets `ui-add` run at
 * all. A generic React hook still belongs in `@monorepo/hook` — so when the CLI
 * drops one here, this guard says so instead of letting it sit.
 *
 * That is how `sidebar.tsx` came to import `@monorepo/hook/use-is-mobile`.
 */
const LOCAL_HOOKS_DIR = "src/hooks";

if (existsSync(LOCAL_HOOKS_DIR)) {
  console.error(
    [
      `ui-add scaffolded ${LOCAL_HOOKS_DIR}/ into @monorepo/ui.`,
      "",
      "A generic React hook belongs in @monorepo/hook. Move the file there,",
      "re-point the component's import at @monorepo/hook/<name>, then delete",
      `${LOCAL_HOOKS_DIR}/ — the #hooks alias exists only so the shadcn CLI can`,
      "resolve its aliases, never as a home for hooks.",
    ].join("\n"),
  );
  process.exit(1);
}
