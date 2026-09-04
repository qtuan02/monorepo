import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Consumer smoke test for the Publish shells (ADR-0004).
 *
 * The Gate proves the source builds; this proves the *tarball* is usable. It
 * packs each shell with `npm pack` — the same tool `changeset publish` shells
 * out to — installs the tarballs into a throwaway Vite + React 19 project
 * outside the workspace, and typechecks and builds it the way a consumer would.
 * Anything that only works because a file sits inside this monorepo — a
 * `catalog:` range npm cannot resolve, an internal `@monorepo/*` specifier, a
 * subpath missing from `exports` — fails here rather than on npm.
 *
 * Run it with `bun run publish:smoke`; pass `--keep` to leave the temporary
 * project on disk and print its path.
 */

type VitePlugin = {
  /** An import line added to the consumer's `vite.config.ts`. */
  importLine: string;
  /** The expression pushed into that config's `plugins` array. */
  expression: string;
};

type Shell = {
  /** The shell workspace, relative to the repo root. */
  dir: string;
  /** The npm name a consumer installs. */
  name: string;
  /** The workspace whose `build` task fills this shell's `dist/`. */
  source: string;
  /** Specifiers that must not survive into this shell's published `dist/`. */
  forbiddenInDist: readonly string[];
  /** Extra dependencies the consumer project needs for this shell. */
  consumerDependencies: Readonly<Record<string, string>>;
  /** Import lines the consumer's `src/main.tsx` opens with. */
  consumerImports: readonly string[];
  /** Statements inside the consumer component, before its `return`. */
  consumerBody: readonly string[];
  /** Markup the consumer component renders for this shell. */
  consumerMarkup: string;
  /** Lines appended to the consumer's `src/index.css`. */
  consumerCss: readonly string[];
  /** Vite plugins this shell's consumer needs. */
  vitePlugins: readonly VitePlugin[];
  /** Substrings a named file inside this shell's `dist/` must carry. */
  distFileMustContain?: Readonly<Record<string, readonly string[]>>;
  /**
   * Substrings the CSS the *consumer* builds must carry. This is the only way
   * to prove a stylesheet shipped in a tarball reached the consumer's Tailwind
   * — the file being present says nothing about it having been scanned.
   */
  builtCssMustContain?: readonly string[];
};

/** Every published shell (ADR-0004). */
const SHELLS: readonly Shell[] = [
  {
    dir: "packages/hook-public",
    name: "@fe-monorepo/hook",
    source: "@monorepo/hook",
    forbiddenInDist: [],
    consumerDependencies: {},
    consumerImports: [
      'import { useDebounce } from "@fe-monorepo/hook/use-debounce";',
    ],
    consumerBody: ["  const debouncedSearch = useDebounce(search, 300);"],
    consumerMarkup: "<p>{debouncedSearch}</p>",
    consumerCss: [],
    vitePlugins: [],
  },
  {
    dir: "packages/ui-public",
    name: "@fe-monorepo/ui",
    source: "@monorepo/ui",
    // `#components/*` and `#utils/cn` are that package's own Node subpath
    // imports: they resolve from inside the workspace and from nowhere else, so
    // one surviving into `dist/` is a tarball that installs and then fails to
    // resolve.
    forbiddenInDist: ["#components", "#utils", "#hooks"],
    consumerDependencies: {
      "@tailwindcss/vite": "^4.3.3",
      tailwindcss: "^4.3.3",
    },
    consumerImports: [
      'import { Button } from "@fe-monorepo/ui/components/button";',
      // Sidebar is the one primitive that reaches the hook compiled into
      // `dist/internal/`. Importing it is what makes `vite build` resolve that
      // relative path — the specifier assertions below cannot check it.
      'import { SidebarProvider } from "@fe-monorepo/ui/components/sidebar";',
    ],
    consumerBody: [],
    consumerMarkup:
      '<SidebarProvider><Button variant="outline">{search}</Button></SidebarProvider>',
    consumerCss: [
      // Exactly the three lines the shell's README tells a consumer to write.
      '@import "tailwindcss";',
      '@import "@fe-monorepo/ui/globals.css";',
      '@source "../node_modules/@fe-monorepo/ui/dist";',
    ],
    vitePlugins: [
      {
        importLine: 'import tailwindcss from "@tailwindcss/vite";',
        expression: "tailwindcss()",
      },
    ],
    distFileMustContain: {
      // Base UI states orientation as a value attribute; the shadcn registry
      // styles against a bare `data-vertical:`. Drop these two and every such
      // utility compiles to no CSS and no error.
      "globals.css": [
        '@custom-variant data-horizontal (&[data-orientation="horizontal"]);',
        '@custom-variant data-vertical (&[data-orientation="vertical"]);',
      ],
    },
    builtCssMustContain: [
      // A Button base utility: proof the `@source` line made Tailwind scan the
      // installed package, which it skips by default under node_modules.
      ".whitespace-nowrap",
      // Proof the two `@custom-variant`s reached the consumer's build — this
      // selector exists only because `data-vertical:` utilities were found
      // while scanning, and only because the CSS entry declared the variant.
      "[data-orientation=vertical]",
    ],
  },
];

/** Never allowed in a published `package.json` — npm resolves neither. */
const FORBIDDEN_IN_MANIFEST = ["catalog:", "workspace:"] as const;

/** Never allowed in any published `dist/`, whichever shell it belongs to. */
const FORBIDDEN_IN_DIST = ["@monorepo/"] as const;

/**
 * What the throwaway consumer installs beside the tarballs. These pins restate
 * numbers the root catalog also holds, and they are meant to: this project
 * stands in for someone outside the repo, who picks their own versions. Wiring
 * them to the catalog would hide exactly the failure worth catching — a package
 * that only works against the React or TypeScript the workspace happens to be
 * on. Bump them when a *consumer* would, not when the catalog moves.
 *
 * The throwaway is `private`, so it makes no dev/runtime split.
 */
const CONSUMER_DEPENDENCIES: Record<string, string> = {
  "@types/react": "19.2.18",
  "@types/react-dom": "19.2.7",
  "@vitejs/plugin-react": "6.1.1",
  react: "19.2.8",
  "react-dom": "19.2.8",
  typescript: "~7.0.2",
  vite: "8.2.2",
};

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures: string[] = [];

function step(message: string): void {
  console.log(`\n> ${message}`);
}

/**
 * `bun`, `bunx` and `npm` are `.cmd` shims on Windows, which `spawnSync` only
 * finds through a shell — and a shell re-splits every argument, so a tarball
 * path under `C:\Users\First Last\…` would arrive as two. Quoting each argument
 * is what keeps a temp directory with a space in it working.
 */
const useShell = process.platform === "win32";

function shellSafe(args: string[]): string[] {
  return useShell ? args.map((arg) => `"${arg}"`) : args;
}

function run(command: string, args: string[], cwd: string): void {
  const printable = [command, ...args].join(" ");
  console.log(`  $ ${printable}`);
  const result = spawnSync(command, shellSafe(args), {
    cwd,
    stdio: "inherit",
    shell: useShell,
  });

  if (result.status !== 0) {
    throw new Error(
      `\`${printable}\` exited with ${result.status ?? "signal"}`,
    );
  }
}

function check(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  ok  ${message}`);
    return;
  }
  console.error(`  FAIL ${message}`);
  failures.push(message);
}

/** Packs one shell and returns the tarball path `npm pack` reported. */
function pack(shell: Shell, destination: string): string {
  const result = spawnSync(
    "npm",
    shellSafe(["pack", "--json", "--pack-destination", destination]),
    {
      cwd: join(repoRoot, shell.dir),
      encoding: "utf8",
      shell: useShell,
    },
  );

  if (result.status !== 0) {
    throw new Error(`npm pack failed for ${shell.name}:\n${result.stderr}`);
  }

  // `npm pack --json` reports one entry per packed package; taking the filename
  // it names rather than globbing the directory keeps two shells apart.
  const packed: unknown = JSON.parse(result.stdout);
  const first = Array.isArray(packed) ? packed[0] : undefined;
  const filename: unknown =
    first && typeof first === "object"
      ? Reflect.get(first, "filename")
      : undefined;

  if (typeof filename !== "string") {
    throw new Error(`npm pack reported no filename for ${shell.name}`);
  }

  return join(destination, filename);
}

/**
 * Whether `text` imports from `specifier`. Matched on the quoted form rather
 * than anywhere in the file: the published CSS entry carries the workspace's
 * own comments, which name `@monorepo/ui` in prose. What must never survive is
 * a *specifier* nothing outside this repo can resolve.
 */
function importsFrom(text: string, specifier: string): boolean {
  return ['"', "'", "`"].some((quote) => text.includes(quote + specifier));
}

/** Reads every file under `root`, keyed by its path. */
async function readFilesUnder(root: string): Promise<Map<string, string>> {
  const files = new Map<string, string>();

  async function walk(directory: string): Promise<void> {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else {
        files.set(path, await readFile(path, "utf8"));
      }
    }
  }

  await walk(root);
  return files;
}

/**
 * Asserts on the installed package rather than the tarball itself: what Bun
 * unpacked into `node_modules` *is* the tarball's contents, and it is also what
 * the consumer's typecheck and build below actually resolve.
 */
async function assertInstalledShell(
  shell: Shell,
  consumerRoot: string,
): Promise<void> {
  const installed = join(
    consumerRoot,
    "node_modules",
    ...shell.name.split("/"),
  );
  if (!existsSync(installed)) {
    check(false, `${shell.name} installed from its tarball`);
    return; // every assertion below reads a file inside it
  }
  check(true, `${shell.name} installed from its tarball`);

  const manifest = await readFile(join(installed, "package.json"), "utf8");
  for (const protocol of FORBIDDEN_IN_MANIFEST) {
    check(
      !manifest.includes(protocol),
      `${shell.name} package.json carries no \`${protocol}\` range`,
    );
  }

  const dist = join(installed, "dist");
  if (!existsSync(dist)) {
    check(false, `${shell.name} ships a dist/`);
    return;
  }
  check(true, `${shell.name} ships a dist/`);

  const files = await readFilesUnder(dist);
  for (const specifier of [...FORBIDDEN_IN_DIST, ...shell.forbiddenInDist]) {
    const offender = [...files].find(([, text]) =>
      importsFrom(text, specifier),
    );
    check(
      offender === undefined,
      `${shell.name} dist/ carries no \`${specifier}\` specifier${
        offender ? ` (found in ${offender[0]})` : ""
      }`,
    );
  }

  for (const [name, expected] of Object.entries(
    shell.distFileMustContain ?? {},
  )) {
    const text = files.get(join(dist, ...name.split("/")));
    if (text === undefined) {
      check(false, `${shell.name} ships dist/${name}`);
      continue;
    }
    check(true, `${shell.name} ships dist/${name}`);

    for (const fragment of expected) {
      check(
        text.includes(fragment),
        `${shell.name} dist/${name} keeps \`${fragment}\``,
      );
    }
  }
}

/**
 * Asserts on the CSS Vite emitted, which exists at all only because Tailwind
 * scanned the installed package: v4 skips `node_modules` unless an `@source`
 * points at it, so a missing or misaimed `@source` line drops every utility the
 * primitives use — with no error anywhere.
 */
async function assertBuiltCss(consumerRoot: string): Promise<void> {
  const expected = SHELLS.flatMap((shell) =>
    (shell.builtCssMustContain ?? []).map(
      (fragment) => [shell.name, fragment] as const,
    ),
  );
  if (expected.length === 0) {
    return;
  }

  const built = await readFilesUnder(join(consumerRoot, "dist"));
  const css = [...built]
    .filter(([path]) => path.endsWith(".css"))
    .map(([, text]) => text)
    // Vite minifies, which drops the quotes around an attribute selector's
    // value. Stripping them here lets an expectation be written one way and
    // match whether or not the consumer minified.
    .map((text) => text.replaceAll('"', "").replaceAll("'", ""))
    .join("\n");

  if (css === "") {
    check(false, "the consumer's build emitted a stylesheet");
    return; // every assertion below reads it
  }
  check(true, "the consumer's build emitted a stylesheet");

  for (const [name, fragment] of expected) {
    check(
      css.includes(fragment),
      `${name} reached the consumer's built CSS (\`${fragment}\`)`,
    );
  }
}

async function scaffoldConsumer(root: string): Promise<void> {
  const dependencies = { ...CONSUMER_DEPENDENCIES };
  for (const shell of SHELLS) {
    Object.assign(dependencies, shell.consumerDependencies);
  }

  await mkdir(join(root, "src"), { recursive: true });

  await writeFile(
    join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "publish-smoke-consumer",
        private: true,
        type: "module",
        dependencies,
      },
      null,
      2,
    )}\n`,
  );

  await writeFile(
    join(root, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "Preserve",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          noUncheckedIndexedAccess: true,
          skipLibCheck: true,
          noEmit: true,
          types: [],
        },
        include: ["src"],
      },
      null,
      2,
    )}\n`,
  );

  const plugins = SHELLS.flatMap((shell) => shell.vitePlugins);
  await writeFile(
    join(root, "vite.config.ts"),
    [
      'import react from "@vitejs/plugin-react";',
      ...plugins.map((plugin) => plugin.importLine),
      'import { defineConfig } from "vite";',
      "",
      "export default defineConfig({",
      `  plugins: [react()${plugins.map((plugin) => `, ${plugin.expression}`).join("")}],`,
      "});",
      "",
    ].join("\n"),
  );

  await writeFile(
    join(root, "index.html"),
    [
      "<!doctype html>",
      '<html lang="vi">',
      "  <head>",
      '    <meta charset="UTF-8" />',
      "    <title>publish smoke</title>",
      "  </head>",
      "  <body>",
      '    <div id="root"></div>',
      '    <script type="module" src="/src/main.tsx"></script>',
      "  </body>",
      "</html>",
      "",
    ].join("\n"),
  );

  await writeFile(
    join(root, "src", "index.css"),
    `${SHELLS.flatMap((shell) => shell.consumerCss).join("\n")}\n`,
  );

  // Vite ships this declaration in `vite/client`, but pulling those types in
  // would also pull `@types/node`; one line is enough to let the entry's
  // side-effect CSS import typecheck.
  await writeFile(join(root, "src", "css.d.ts"), 'declare module "*.css" {}\n');

  // The entry imports every shell the way that shell's README tells a consumer
  // to, so `tsc` resolves each subpath's `.d.ts` and Vite resolves each `.js`.
  await writeFile(
    join(root, "src", "main.tsx"),
    [
      'import { useState } from "react";',
      'import { createRoot } from "react-dom/client";',
      ...SHELLS.flatMap((shell) => shell.consumerImports),
      "",
      'import "./index.css";',
      "",
      "function App() {",
      '  const [search, setSearch] = useState("");',
      ...SHELLS.flatMap((shell) => shell.consumerBody),
      "",
      "  return (",
      "    <div>",
      "      <input",
      "        value={search}",
      "        onChange={(event) => setSearch(event.target.value)}",
      "      />",
      ...SHELLS.map((shell) => `      ${shell.consumerMarkup}`),
      "    </div>",
      "  );",
      "}",
      "",
      'const container = document.getElementById("root");',
      'if (!container) throw new Error("missing #root");',
      "createRoot(container).render(<App />);",
      "",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const keep = process.argv.includes("--keep");
  const workspace = mkdtempSync(join(tmpdir(), "fe-monorepo-publish-smoke-"));
  const tarballDir = join(workspace, "tarballs");
  const consumerRoot = join(workspace, "consumer");
  await mkdir(tarballDir, { recursive: true });
  await mkdir(consumerRoot, { recursive: true });

  try {
    step("Build each shell's dist/ from its source package");
    run(
      "bun",
      [
        "run",
        "build",
        ...SHELLS.flatMap((shell) => ["--filter", shell.source]),
      ],
      repoRoot,
    );

    step("Pack each shell with npm pack");
    const tarballs = SHELLS.map((shell) => {
      const tarball = pack(shell, tarballDir);
      console.log(`  ${shell.name} -> ${tarball}`);
      return tarball;
    });

    step("Scaffold a throwaway Vite + React 19 consumer");
    await scaffoldConsumer(consumerRoot);
    console.log(`  ${consumerRoot}`);

    step("Install the tarballs the way a consumer would");
    run("bun", ["install"], consumerRoot);
    run("bun", ["add", ...tarballs], consumerRoot);

    step("Assert nothing internal survived into the published files");
    for (const shell of SHELLS) {
      await assertInstalledShell(shell, consumerRoot);
    }

    step("Typecheck and build the consumer");
    run("bunx", ["tsc", "--noEmit"], consumerRoot);
    run("bunx", ["vite", "build"], consumerRoot);

    step("Assert the shipped stylesheet reached the consumer's build");
    await assertBuiltCss(consumerRoot);
  } finally {
    if (keep) {
      console.log(`\nKept the smoke workspace at ${workspace}`);
    } else {
      rmSync(workspace, { recursive: true, force: true });
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} assertion(s) failed:`);
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }

  console.log("\nOK - publish smoke test passed");
}

await main();
