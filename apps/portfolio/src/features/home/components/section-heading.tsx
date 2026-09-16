import type { ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
}

/**
 * The title every section after the hero opens with.
 *
 * One component rather than an `<h2>` written seven times: the redesign changes
 * what a section title looks like, and that change has to land in one place so
 * the seven sections cannot drift apart. The level is fixed here too — the
 * hero owns the page's one `<h1>`, so every section title sits one level under
 * it and the outline stays sequential.
 */
export default function SectionHeading({ children }: SectionHeadingProps) {
  return <h2 className="text-xl font-bold">{children}</h2>;
}
