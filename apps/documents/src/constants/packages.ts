/**
 * The two npm packages this site documents.
 *
 * These are the names a **consumer** types, not the workspace names the app
 * itself imports (`@monorepo/ui`, `@monorepo/hook`). The two are deliberately
 * different: the workspace package is source-only and private, the published
 * shell in `packages/ui-public` / `packages/hook-public` is what npm serves.
 * Never "synchronise" them.
 */
export const UI_PACKAGE_NAME = "@fe-monorepo/ui";
export const HOOK_PACKAGE_NAME = "@fe-monorepo/hook";

/** Every primitive is published under `components/<file name>`. */
export const UI_COMPONENT_SUBPATH_PREFIX = "components/";

/** A hook is published at the bare file name, with no prefix at all. */
export const HOOK_SUBPATH_PREFIX = "";

export const NPM_URLS = {
  ui: `https://www.npmjs.com/package/${UI_PACKAGE_NAME}`,
  hook: `https://www.npmjs.com/package/${HOOK_PACKAGE_NAME}`,
} as const;

export interface PeerDependency {
  name: string;
  range: string;
}

/**
 * Copied by value from the `peerDependencies` block of each publish shell
 * (`packages/{ui,hook}-public/package.json`). Two values per package, and a
 * change to either goes through the publish ticket first — reading the real
 * file at runtime is not possible from a browser bundle.
 */
export const PEER_DEPENDENCIES: Record<
  "ui" | "hook",
  readonly PeerDependency[]
> = {
  ui: [
    { name: "react", range: ">=19" },
    { name: "react-dom", range: ">=19" },
    { name: "tailwindcss", range: "^4" },
  ],
  hook: [
    { name: "react", range: ">=19" },
    { name: "react-dom", range: ">=19" },
  ],
};

export interface InstallCommand {
  id: string;
  label: string;
  command: string;
}

export const INSTALL_COMMANDS: readonly InstallCommand[] = [
  {
    id: "bun",
    label: "bun",
    command: `bun add ${UI_PACKAGE_NAME} ${HOOK_PACKAGE_NAME}`,
  },
  {
    id: "npm",
    label: "npm",
    command: `npm install ${UI_PACKAGE_NAME} ${HOOK_PACKAGE_NAME}`,
  },
  {
    id: "pnpm",
    label: "pnpm",
    command: `pnpm add ${UI_PACKAGE_NAME} ${HOOK_PACKAGE_NAME}`,
  },
];
