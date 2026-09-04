/**
 * Turborepo generators — `bun run gen:package`, `gen:tooling`, `gen:app`.
 *
 * Those root scripts call the `gen` binary that `@turbo/gen` installs, rather
 * than `bunx turbo gen`: on Windows `turbo gen` truncates the JSON argument it
 * passes to the generator process, so the run dies before the first prompt.
 * The binary is the same code path without that hop — keep the spelling.
 */

import { execSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type { PlopTypes } from "@turbo/gen";

interface PackageJson {
  name: string;
  scripts: Record<string, string>;
  // Optional on purpose: the scaffold template ships only devDependencies, so
  // `dependencies` is genuinely absent until the first dep is added below.
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// The npm registry's dist-tags endpoint; `fetch` types its body as `unknown`.
interface DistTags {
  latest: string;
}

/**
 * A Runtime is how an app is executed, and it decides which Template app a new
 * app is cloned from (CONTEXT.md). Add a Runtime to this union and to RUNTIMES
 * below — `satisfies` makes the compiler demand the second edit — and nothing
 * else in this file has to change: every branch on a Runtime reads RUNTIMES.
 */
type Runtime = "next" | "vite";

interface RuntimeSpec {
  /**
   * A new app is a copy of this Template app, not a parallel set of .hbs
   * templates that would silently drift from it.
   */
  template: string;
  /** What the `runtime` prompt shows for this choice. */
  description: string;
}

const RUNTIMES = {
  next: {
    template: "_template_next",
    description:
      "next — Next.js 16 App Router, SSR/SEO, Node standalone runner",
  },
  vite: {
    template: "_template_vite",
    description: "vite — SPA behind a login, no crawler, nginx runner",
  },
} as const satisfies Record<Runtime, RuntimeSpec>;

const RUNTIME_CHOICES = Object.entries(RUNTIMES).map(([value, spec]) => ({
  name: spec.description,
  value,
}));

/**
 * These can sit inside a Template app's folder but must never be cloned: each
 * one is a build or test artifact the root .gitignore drops. `.next` and
 * `test-results` are the two the reference generator never had to think about.
 */
const APP_ARTIFACTS = new Set([
  "node_modules",
  "dist",
  ".next",
  ".cache",
  ".turbo",
  ".vitest",
  "coverage",
  "test-results",
  "playwright-report",
]);

/**
 * Every app states its two ports in `apps/<app>/ports.env` and nowhere else, so
 * the generator has one file to read when it looks for a free pair and one to
 * rewrite when it has found one. A dotenv file rather than a TS module for two
 * reasons: the Next Runtime's `dev`/`start` scripts feed it straight to
 * dotenv-cli, and Biome does not handle the extension — so no formatter can
 * reshape the two lines these patterns match.
 */
const PORTS_FILE = "ports.env";
const DEV_PORT_LINE = /^PORT=(\d+)/m;
const E2E_PORT_LINE = /^E2E_PORT=(\d+)/m;

/**
 * One pair per app: dev `3000 + n`, e2e `3100 + n`. Two bands a hundred apart
 * rather than adjacent numbers, so an app's dev server and its E2E server can
 * never be mistaken for each other's — which matters more than it looks,
 * because `reuseExistingServer` would hand a spec run the wrong server and
 * still report green.
 *
 * `apps/storybook` sits on Storybook's conventional 6006, outside the bands and
 * with no E2E server, so it declares no `ports.env` and this scan skips it.
 */
const DEV_PORT_BASE = 3000;
const E2E_PORT_BASE = 3100;
const PORT_BAND_SIZE = 100;

interface PortPair {
  dev: number;
  e2e: number;
}

/**
 * Reads one app's pair, or null when that app declares none.
 *
 * A regex over the file rather than an import: this generator runs as plain
 * Node under plop, which cannot load a TypeScript module. `ports.env` is data,
 * so this reader and the two lines `assignPorts` writes match by construction —
 * and it throws on a file that declares only one of them, because a half-read
 * pair would hand out a port something is already listening on.
 */
function readPorts(appDir: string): PortPair | null {
  const file = path.join(appDir, PORTS_FILE);
  if (!existsSync(file)) return null;

  const source = readFileSync(file, "utf8");
  const dev = DEV_PORT_LINE.exec(source)?.[1];
  const e2e = E2E_PORT_LINE.exec(source)?.[1];

  if (!dev || !e2e) {
    throw new Error(
      `${file} does not declare both \`PORT=<number>\` and \`E2E_PORT=<number>\` on their own lines, which is the shape turbo/generators/config.ts reads and writes.`,
    );
  }
  return { dev: Number(dev), e2e: Number(e2e) };
}

/**
 * The lowest slot whose *both* ports are free, so deleting a generated app
 * returns its pair to the pool instead of burning it forever.
 *
 * The fresh clone is already on disk and still holds the Template's numbers, so
 * it is skipped by name — counting it would rule out the Template's own slot,
 * which was never free to begin with. A port declared outside the bands (an app
 * that arrived with one of its own) is still read, so a number cannot be handed
 * out twice — for every app that declares a `ports.env`. An app
 * that states its port some other way is invisible to this scan, the way
 * `apps/storybook` is, so a migrated app landing inside either band has to
 * declare `ports.env` like the rest.
 */
function nextFreePortPair(root: string, skipApp: string): PortPair {
  const appsDir = path.join(root, "apps");
  const taken = new Set<number>();

  for (const entry of readdirSync(appsDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === skipApp) continue;

    const pair = readPorts(path.join(appsDir, entry.name));
    if (!pair) continue;

    taken.add(pair.dev);
    taken.add(pair.e2e);
  }

  for (let slot = 0; slot < PORT_BAND_SIZE; slot += 1) {
    const dev = DEV_PORT_BASE + slot;
    const e2e = E2E_PORT_BASE + slot;
    if (!taken.has(dev) && !taken.has(e2e)) return { dev, e2e };
  }

  throw new Error(
    `apps/ has used every slot in the ${DEV_PORT_BASE}/${E2E_PORT_BASE} port bands. Widen both in turbo/generators/config.ts rather than hand-picking a number.`,
  );
}

/**
 * Give the fresh clone its own ports.
 *
 * `cpSync` copies `ports.env` verbatim, so without this the clone holds the
 * Template's pair — the collision moves file but survives. The dev half of it
 * is loud; the E2E half is not, because `reuseExistingServer` hands the new
 * app's specs the Template's server and the run still looks green. That is what
 * makes this a correctness fix rather than an ergonomic one.
 *
 * It throws on a missing file, for the reason `renameInApp` does: plop counts a
 * rewrite that changed nothing as a success, and here that would ship exactly
 * the collision this action exists to prevent.
 */
function assignPorts(
  plop: PlopTypes.NodePlopAPI,
): PlopTypes.CustomActionFunction {
  return (answers) => {
    const name = readName(answers);
    if (!name) return "No ports assigned";

    const root = plop.getDestBasePath();
    const appDir = path.join(root, "apps", name);

    if (!readPorts(appDir)) {
      throw new Error(
        `apps/${name}/${PORTS_FILE} is missing — the Template app no longer declares its ports there, so turbo/generators/config.ts has to change with it.`,
      );
    }

    const { dev, e2e } = nextFreePortPair(root, name);
    const target = path.join(appDir, PORTS_FILE);
    const before = readFileSync(target, "utf8");

    writeFileSync(
      target,
      before
        .replace(DEV_PORT_LINE, `PORT=${dev}`)
        .replace(E2E_PORT_LINE, `E2E_PORT=${e2e}`),
    );
    return `apps/${name} took ports ${dev} (dev) and ${e2e} (e2e)`;
  };
}

function readName(answers: object): string | null {
  return "name" in answers && typeof answers.name === "string"
    ? answers.name
    : null;
}

// A type predicate over RUNTIMES rather than a second list of the literals:
// restating them here is how a third Runtime would compile clean and still be
// rejected at runtime, half-scaffolding the app it was asked for.
function isRuntime(value: string): value is Runtime {
  return Object.hasOwn(RUNTIMES, value);
}

function readRuntime(answers: object): Runtime | null {
  if (!("runtime" in answers) || typeof answers.runtime !== "string") {
    return null;
  }
  return isRuntime(answers.runtime) ? answers.runtime : null;
}

const sanitizeName: PlopTypes.CustomActionFunction = (answers) => {
  if ("name" in answers && typeof answers.name === "string") {
    answers.name = answers.name.replace(/^@monorepo\//, "");
  }
  return "Config sanitized";
};

function addDependencies(dir: string): PlopTypes.ActionType {
  return {
    type: "modify",
    path: `${dir}/{{ name }}/package.json`,
    async transform(content, answers) {
      if ("deps" in answers && typeof answers.deps === "string") {
        const pkg = JSON.parse(content) as PackageJson;
        for (const dep of answers.deps.split(" ").filter(Boolean)) {
          const distTags = (await fetch(
            `https://registry.npmjs.org/-/package/${dep}/dist-tags`,
          ).then((res) => res.json())) as DistTags;
          if (!pkg.dependencies) pkg.dependencies = {};
          pkg.dependencies[dep] = `^${distTags.latest}`;
        }
        return JSON.stringify(pkg, null, 2);
      }
      return content;
    },
  };
}

function installAndFormat(
  plop: PlopTypes.NodePlopAPI,
  dir: string,
  extraPaths: string[] = [],
): PlopTypes.CustomActionFunction {
  return (answers) => {
    const name = readName(answers);
    if (!name) return "Nothing scaffolded";

    // Run from the repo root, so `gen` works when invoked from a subdirectory.
    const root = plop.getDestBasePath();
    execSync("bun install", { stdio: "inherit", cwd: root });
    execSync(
      `bunx biome check --write ${[`${dir}/${name}`, ...extraPaths].join(" ")}`,
      { stdio: "inherit", cwd: root },
    );
    return `${dir}/${name} scaffolded`;
  };
}

/** `packages/*` and `tooling/*` are both plain subpath-only workspaces. */
function libraryGenerator(
  plop: PlopTypes.NodePlopAPI,
  dir: "packages" | "tooling",
  label: string,
): PlopTypes.PlopGeneratorConfig {
  return {
    description: `Generate a new ${label} for the monorepo`,
    prompts: [
      {
        type: "input",
        name: "name",
        message: `What is the name of the ${label}? (You can skip the \`@monorepo/\` prefix)`,
      },
      {
        type: "input",
        name: "deps",
        message:
          "Enter a space separated list of dependencies you would like to install",
      },
    ],
    actions: [
      sanitizeName,
      {
        type: "add",
        path: `${dir}/{{ name }}/package.json`,
        templateFile: "templates/package.json.hbs",
      },
      {
        type: "add",
        path: `${dir}/{{ name }}/tsconfig.json`,
        templateFile: "templates/tsconfig.json.hbs",
      },
      {
        // Named for the package, not `index.ts`: every package is subpath-only
        // (`@monorepo/<name>/<file>`), so a barrel entry would be unimportable.
        type: "add",
        path: `${dir}/{{ name }}/src/{{ name }}.ts`,
        template: "export const name = '{{ name }}';",
      },
      addDependencies(dir),
      installAndFormat(plop, dir),
    ],
  };
}

/**
 * Rename the Template app inside one file of the fresh clone.
 *
 * `line` is written once and called twice — with the Template app's folder name
 * to build the needle, and with the new app's name to build its replacement —
 * so the two can never describe different shapes.
 *
 * It throws when the needle is missing, deliberately. Plop's own `modify`
 * action reports a pattern that matches nothing as a success, which here would
 * hand back an app whose Dockerfile still builds the Template app.
 */
function renameInApp(
  plop: PlopTypes.NodePlopAPI,
  file: string,
  line: (app: string) => string,
): PlopTypes.CustomActionFunction {
  return (answers) => {
    const name = readName(answers);
    const runtime = readRuntime(answers);
    if (!name || !runtime) return "Nothing renamed";

    const { template } = RUNTIMES[runtime];
    const target = path.join(plop.getDestBasePath(), "apps", name, file);
    const before = readFileSync(target, "utf8");
    const needle = line(template);

    if (!before.includes(needle)) {
      throw new Error(
        `apps/${name}/${file} has no \`${needle}\` to rename — apps/${template} changed shape, so turbo/generators/config.ts has to change with it.`,
      );
    }

    writeFileSync(target, before.replaceAll(needle, line(name)));
    return `apps/${name}/${file} renamed`;
  };
}

function appGenerator(
  plop: PlopTypes.NodePlopAPI,
): PlopTypes.PlopGeneratorConfig {
  return {
    description: "Generate a new web app cloned from a Template app",
    prompts: [
      {
        type: "input",
        name: "name",
        message:
          "What is the name of the app? (You can skip the `@monorepo/` prefix)",
      },
      {
        type: "list",
        name: "runtime",
        message: "Which Runtime should the app use?",
        choices: RUNTIME_CHOICES,
      },
    ],
    actions: [
      sanitizeName,
      (answers) => {
        const name = readName(answers);
        const runtime = readRuntime(answers);
        // A throw, not a message: plop counts a returned string as a success
        // and runs the rest of the list, and the root-package.json action below
        // guards on the name alone — so a Runtime this file cannot resolve
        // would leave `dev:<name>`/`build:<name>` behind for an app that was
        // never cloned. Aborting here is what keeps the two consistent.
        if (!name || !runtime) {
          throw new Error(
            "gen:app needs both a name and a Runtime, and one of the two prompts came back empty or unrecognized.",
          );
        }

        const { template } = RUNTIMES[runtime];
        const root = plop.getDestBasePath();
        // A verbatim copy rather than plop's `addMany`: every file is rendered
        // as a handlebars template by `addMany`, which would corrupt the bytes
        // of public/favicon.png.
        cpSync(
          path.join(root, "apps", template),
          path.join(root, "apps", name),
          {
            recursive: true,
            errorOnExist: true,
            force: false,
            filter: (src) => !APP_ARTIFACTS.has(path.basename(src)),
          },
        );
        return `apps/${name} cloned from apps/${template}`;
      },
      renameInApp(plop, "package.json", (app) => `"name": "@monorepo/${app}"`),
      // The Dockerfile addresses the app by both its folder and its package
      // name, and both Template apps spell the two ARGs the same way.
      renameInApp(plop, "Dockerfile", (app) => `ARG APP_DIRNAME=${app}`),
      renameInApp(plop, "Dockerfile", (app) => `ARG PROJECT=@monorepo/${app}`),
      assignPorts(plop),
      {
        // Root keeps one script per app rather than a fan-out task. Both
        // Runtimes take the same three, because Turbo drives `dev`/`build`
        // through the app's own package.json and Playwright through `--filter`.
        type: "modify",
        path: "package.json",
        transform(content, answers) {
          const name = readName(answers);
          if (!name) return content;

          const pkg = JSON.parse(content) as PackageJson;
          pkg.scripts[`dev:${name}`] =
            `turbo watch dev -F @monorepo/${name}...`;
          pkg.scripts[`build:${name}`] =
            `turbo run build -F @monorepo/${name}...`;
          pkg.scripts[`e2e:headed:${name}`] =
            `bun run --filter @monorepo/${name} e2e:headed`;
          return JSON.stringify(pkg, null, 2);
        },
      },
      installAndFormat(plop, "apps", ["package.json"]),
      // Last, so it is the final line the run prints — after `bun install`'s
      // noise. Re-read from disk rather than remembered, so it reports what the
      // app actually holds once every earlier action has run.
      (answers) => {
        const name = readName(answers);
        const runtime = readRuntime(answers);
        if (!name || !runtime) return "No port follow-up to print";

        const { template } = RUNTIMES[runtime];
        const pair = readPorts(path.join(plop.getDestBasePath(), "apps", name));
        if (!pair) return "No port follow-up to print";

        return `NEXT: apps/${name} listens on ${pair.dev} (dev) and ${pair.e2e} (e2e), declared once in apps/${name}/${PORTS_FILE}. Start it beside apps/${template} to confirm — \`bun run e2e\` cannot prove it, because Playwright reuses a server already on the port and a collision reads as a pass.`;
      },
    ],
  };
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("package", libraryGenerator(plop, "packages", "package"));
  plop.setGenerator(
    "tooling",
    libraryGenerator(plop, "tooling", "tooling config"),
  );
  plop.setGenerator("app", appGenerator(plop));
}
