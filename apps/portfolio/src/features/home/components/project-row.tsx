import { ExternalLinkIcon } from "lucide-react";

import type {
  ProjectSource,
  ProjectSourceId,
} from "~/features/home/types/resume";
import { GithubIcon } from "~/components/icons/github-icon";
import StandardBlock from "~/features/home/components/standard-block";

interface ProjectRowProps {
  name: string;
  description: string;
  techStack: readonly string[];
  source?: readonly ProjectSource[];
  demo?: string;
  /** Link text per kind of source, already localized. */
  sourceLabels: Readonly<Record<ProjectSourceId, string>>;
  /** Link text for the live deployment, already localized. */
  demoLabel: string;
}

// 14 px, the floor `ux#67` sets for meta — and these are controls, not labels:
// the contact lines, the closest thing on the page, read at the same size.
// `py-1.5 -my-1.5`: a 32 px tap target (`ux#104`) without widening the line
// itself — the negative margin cancels the padding's own footprint in flow.
const linkClassName =
  "inline-flex items-center gap-1 py-1.5 -my-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * One project, as its own standard block: the name on its own row, a
 * two-to-three-sentence description, the stack as a line of muted monospace,
 * and the links as the block's last row.
 *
 * The links used to share the name's row, right-aligned via
 * `justify-between` (#272) — which wrapped onto its own line at whatever
 * point the name and the link labels together ran out of room, differently
 * per name length and per breakpoint. Splitting the name onto its own row and
 * moving the links after the description/stack removes that dependency
 * entirely: the links row is always the block's last row, never sharing a
 * line with the name.
 *
 * A block per project (#269), same shape as a work role — with only two
 * projects left after #265 dropped the monorepo card, a shared block ran
 * their two longer descriptions into one another with nothing marking where
 * one project ends and the next begins. Still no bullets or badge (#125):
 * these are worth a link, not a pitch, so the block stays a name, one short
 * description, a line of stack and its links — never the three-bullet weight
 * of a work role.
 *
 * Two typefaces, split by what the text is (`docs/design/portfolio-redesign-v2.md`
 * §7, decision 2): the name and the stack are labels and set in monospace; the
 * description is prose and stays in sans.
 *
 * A link renders only where there is a URL. A "Xem demo" with no href is a dead
 * control a recruiter clicks on; the row's one job is to make the code and the
 * deployment one click away, so nothing here pretends to.
 */
export default function ProjectRow({
  name,
  description,
  techStack,
  source,
  demo,
  sourceLabels,
  demoLabel,
}: ProjectRowProps) {
  const hasLinks = Boolean(source?.length || demo);

  return (
    <StandardBlock className="flex flex-col gap-1.5">
      <h3 className="font-mono text-base leading-snug font-bold">{name}</h3>
      {/* 15 px, the same as About's prose and a Work bullet: `ux#67` puts the
          floor for body copy there, and a two-to-three-sentence description is
          still copy. */}
      <p className="text-body leading-relaxed">{description}</p>
      {/* The stack as one line of text — the shape the work rows and the
          skills list use — rather than a chip per name: chips are what made
          a demo project read like a product listing. */}
      {techStack.length > 0 && (
        <p className="font-mono text-sm leading-relaxed text-muted-foreground">
          {techStack.join(" · ")}
        </p>
      )}
      {hasLinks && (
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {source?.map((entry) => (
            <a
              key={entry.id}
              href={entry.href}
              target="_blank"
              rel="noreferrer"
              className={linkClassName}
            >
              <GithubIcon className="size-3.5" />
              {sourceLabels[entry.id]}
            </a>
          ))}
          {demo && (
            <a
              href={demo}
              target="_blank"
              rel="noreferrer"
              className={linkClassName}
            >
              <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
              {demoLabel}
            </a>
          )}
        </div>
      )}
    </StandardBlock>
  );
}
