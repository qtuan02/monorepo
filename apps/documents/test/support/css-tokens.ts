/**
 * Reading a stylesheet as **text**.
 *
 * A jsdom test computes no styles, and the palette lives in CSS custom
 * properties that only a real cascade resolves. What a unit test can assert is
 * the contract a stylesheet writes — which tokens, in which block, with which
 * value — and these helpers read that contract structurally rather than by
 * position. `test/globals.test.ts` checks the override against the shared theme
 * with them. Copied from `apps/portfolio/test/support` — an app never imports
 * another app's test tree.
 */

/**
 * `source` with block and line comments removed. Both stylesheets are parsed
 * structurally, and the prose in `globals.css` quotes the very syntax being
 * looked for — a `@theme inline {…}` in a comment would otherwise read as a
 * region of its own, and a comment naming both teals as a colour the app
 * writes.
 */
export function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}

/** The index just past the `}` that closes the block opened at `open`. */
function blockEnd(source: string, open: number): number {
  let depth = 0;
  let index = open;

  for (; index < source.length; index++) {
    if (source[index] === "{") depth++;
    if (source[index] === "}") depth--;
    if (depth === 0) break;
  }

  return index;
}

/** Every `@<name> …{…}` region of `source`, whole, outermost first. */
export function atRuleRegions(source: string, name = "[\\w-]+"): string[] {
  const regions: string[] = [];
  const opener = new RegExp(`@${name}[^;{]*\\{`, "g");
  let cursor = 0;

  for (const match of source.matchAll(opener)) {
    // Skip an at-rule nested inside one already taken, so a nested at-rule is
    // not reported as a region of its own.
    if (match.index < cursor) continue;

    const open = match.index + match[0].length - 1;
    const close = blockEnd(source, open);

    regions.push(source.slice(match.index, close + 1));
    cursor = close;
  }

  return regions;
}

/**
 * `source` with every at-rule block removed — what is left is the declarations
 * that apply unlayered and unconditionally. This is the distinction the whole
 * override rests on, so it is read structurally rather than by position:
 * a `@media` block could re-declare `.dark` as well, and a plain search for
 * `.dark {` would happily read that as part of the palette.
 */
export function unconditional(source: string): string {
  let stripped = source;

  for (const region of atRuleRegions(source)) {
    stripped = stripped.replace(region, "");
  }

  return stripped;
}

/**
 * Every custom property declared in a `selector {…}` block of `source`, the
 * blocks merged. Values are whitespace-normalised, because Biome may wrap a
 * long value across lines and the comparison must not care.
 */
export function declarationsOf(
  source: string,
  selector: string,
): Record<string, string> {
  const declarations: Record<string, string> = {};
  const opener = `${selector} {`;

  for (
    let start = source.indexOf(opener);
    start !== -1;
    start = source.indexOf(opener, start + 1)
  ) {
    const open = start + opener.length - 1;
    const body = source.slice(open + 1, blockEnd(source, open));

    for (const match of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
      declarations[match[1] as string] = (match[2] as string)
        .replace(/\s+/g, " ")
        .replace(/\( /g, "(")
        .replace(/ \)/g, ")")
        .trim();
    }
  }

  return declarations;
}

/**
 * A declaration a test cannot proceed without. `noUncheckedIndexedAccess`
 * makes every lookup `string | undefined`, and a silent `?? ""` fallback would
 * turn a token that has been renamed away into a passing assertion.
 */
export function declared(
  declarations: Record<string, string>,
  token: string,
): string {
  const value = declarations[token];

  if (!value) {
    throw new Error(`Expected a declaration for --${token}`);
  }

  return value;
}
