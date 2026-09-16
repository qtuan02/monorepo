import type { ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
}

/**
 * The title every section after the hero opens with: a markdown `##` in the
 * accent, then the title in monospace, upper-cased and letter-spaced — the
 * terminal grammar at the one place a reader's eye lands first in each section.
 *
 * One component rather than an `<h2>` written seven times: the redesign changes
 * what a section title looks like, and that change has to land in one place so
 * the seven sections cannot drift apart. The level is fixed here too — the
 * hero owns the page's one `<h1>`, so every section title sits one level under
 * it and the outline stays sequential.
 *
 * The `##` is decoration and stays out of the accessible name: `aria-hidden`,
 * so a screen reader hears "Kinh nghiệm", not "number number Kinh nghiệm", and
 * a `getByRole("heading", { name })` in a spec matches the title alone.
 * `select-none` for the same reason on the visual side — copying a heading
 * should not paste a markdown mark in front of it.
 */
export default function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h2 className="font-mono text-lg font-bold tracking-widest uppercase">
      <span aria-hidden="true" className="text-primary select-none">
        ##{" "}
      </span>
      {children}
    </h2>
  );
}
