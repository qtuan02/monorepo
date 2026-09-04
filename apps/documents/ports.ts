/**
 * The two ports this app listens on. The numbers themselves live in
 * `ports.env` beside this file — the comments there say why.
 *
 * Read as text rather than imported: this module is evaluated in the *config*
 * context (Node/Bun, before any bundler — a Vite Runtime's config bundle pulls
 * it through Rolldown, Playwright transforms it with Babel), and a JSON or env
 * import attribute is not portable across those loaders.
 * `readFileSync(new URL(…, import.meta.url))` is the one read shape all of them
 * agree on, and it depends on the app's `"type": "module"`: without it
 * Playwright loads this file as CommonJS, where `import.meta` is a syntax
 * error.
 *
 * This file is byte-identical in both Template apps on purpose, so it names
 * neither the app nor a Runtime-specific config file — which config reads which
 * export is stated at the exports themselves.
 *
 * It must import nothing from `src/`, and must never read `process.env` — the
 * `apps/**` Biome override forbids the second, and the first would drag the
 * app's module graph into a config load.
 */
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./ports.env", import.meta.url), "utf8");

function readPort(line: string, pattern: RegExp): number {
  // `source.match(pattern)` rather than `pattern.exec(source)`: Biome reads
  // `RegExp.prototype.exec` as returning a non-nullish value, so it flags any
  // null check on it as an unnecessary condition — and the Gate's standard is
  // zero warnings. `String.prototype.match` it types honestly. Neither pattern
  // carries `g`, so both spellings return the capture groups.
  const match = source.match(pattern);
  const port = match ? match[1] : undefined;
  if (!port) {
    throw new Error(`ports.env beside this file has no \`${line}\` line.`);
  }
  return Number(port);
}

/**
 * The port `bun run dev` binds — and, in the Next Runtime, `bun run start` too.
 * Only a Vite Runtime imports this binding (its `vite.config.ts` takes
 * `server.port` from it); a Next app's scripts read the same `PORT=` line
 * straight out of `ports.env` through dotenv-cli, so there this export exists to
 * make a `ports.env` missing that line throw while a config loads.
 */
export const DEV_PORT = readPort("PORT=<number>", /^PORT=(\d+)/m);
/**
 * The production server Playwright starts for `bun run e2e`. Both Runtimes
 * import this one — Vite as `preview.port`, Next as `webServer.env.PORT`.
 */
export const E2E_PORT = readPort("E2E_PORT=<number>", /^E2E_PORT=(\d+)/m);
