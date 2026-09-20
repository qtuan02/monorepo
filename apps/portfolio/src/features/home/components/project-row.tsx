import { ExternalLinkIcon } from "lucide-react";

import type {
  ProjectSource,
  ProjectSourceId,
} from "~/features/home/types/resume";
import { GithubIcon } from "~/components/icons/github-icon";

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
 * One project, as a row of the projects block: the name, the links out beside
 * it, a one-line pitch, and the stack as a line of muted monospace.
 *
 * A row rather than a card (#125). These are learning and demo projects — a
 * public repo and a live deployment each, none of them a production product —
 * and the v2 card gave each one a block of its own, three bullets and a badge:
 * the weight of a work role. What a reader needs from this section is the
 * link, so the row is built around it: the links sit on the name's line, the
 * pitch is one sentence, and the stack is text, not chips. The rows share the
 * section's one `StandardBlock`; this component draws no block of its own.
 *
 * Two typefaces, split by what the text is (`docs/design/portfolio-redesign-v2.md`
 * §7, decision 2): the name and the stack are labels and set in monospace; the
 * pitch is prose and stays in sans.
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
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-mono text-base leading-snug font-bold">{name}</h3>
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
      </div>
      {/* 15 px, the same as About's prose and a Work bullet: `ux#67` puts the
          floor for body copy there, and a one-line pitch is still copy. */}
      <p className="text-body leading-relaxed">{description}</p>
      {/* The stack as one line of text — the shape the work rows and the
          skills list use — rather than a chip per name: chips are what made
          a demo project read like a product listing. */}
      {techStack.length > 0 && (
        <p className="font-mono text-sm leading-relaxed text-muted-foreground">
          {techStack.join(" · ")}
        </p>
      )}
    </div>
  );
}
