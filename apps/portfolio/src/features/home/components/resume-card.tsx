"use client";

import type { StaticImageData } from "next/image";
import { useId, useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

import { cn } from "@monorepo/ui/utils/cn";

import StandardBlock from "~/features/home/components/standard-block";

/** One body line. `id` is the message-key segment, so it is stable and unique. */
export interface ResumeBullet {
  id: string;
  text: string;
}

interface ResumeCardProps {
  logo: StaticImageData;
  /** Alt text for the logo — the organisation's own name. */
  altText: string;
  title: string;
  subtitle?: string;
  /** A one-line blurb naming what industry the company is in, muted. */
  summary?: string;
  /** A label such as "Feb 2025 – Feb 2026", already localized. */
  period: string;
  /** Where the row leads when it has no body of its own to expand. */
  href?: string;
  /** Already-localized body lines, each with the message key it came from. */
  bullets?: readonly ResumeBullet[];
  techStack?: readonly string[];
  /** Prefix in front of the tech-stack list, e.g. "Tech Stack:". */
  techStackLabel?: string;
  /**
   * Read after the heading text on the expand/collapse control — appended
   * rather than set as `aria-label`, which would replace the organisation's
   * name and leave every Work heading announcing the same three words.
   */
  toggleLabel?: string;
  defaultExpanded?: boolean;
}

/**
 * One row of the CV: a logo, a heading line with its period, and — for a role
 * that has one — a body of bullets and a tech stack that folds away.
 *
 * The row is a `StandardBlock` — the page's one block shape — rather than
 * `@monorepo/ui/components/card`, and that is deliberate: `Card` ships
 * `ring-1`, `shadow-xs`, `overflow-hidden` and its own header/content/footer
 * anatomy, and a CV row wants a 2 px edge, a hard shadow and a logo beside a
 * column. Using the primitive and then switching its utilities back off is
 * working against it. The rule this looks like it breaks forbids
 * **re-implementing** a primitive; arranging a slice's own layout inside the
 * slice's own block is what the block is for.
 *
 * Two typefaces, split by what the text is (`docs/design/portfolio-redesign-v2.md`
 * §7, decision 2): the organisation's name, the period and the tech stack are
 * labels and set in monospace; the role and the bullets are prose and stay in
 * sans, so a Vietnamese sentence that runs to three lines is not read in a code
 * font.
 *
 * No award badge (#275): the one row that wore one carried a `Badge` inside a
 * `Tooltip`, whose full name then had to be repeated in an `sr-only` span
 * because a tooltip opens on hover and a phone has none — three moving parts,
 * and the owner judged the prize itself not worth the line. The contribution
 * behind it is still a bullet in that row's body, which is where a claim on a
 * CV belongs.
 *
 * The header wraps rather than shrinks. On a 375 px phone a monospace period
 * beside a monospace name does not fit on one line, and the alternative — the
 * period breaking mid-date — reads as a typo. `flex-wrap` moves the whole
 * right-hand group under the name instead, as one piece.
 *
 * The header is the WAI-ARIA accordion shape — a heading whose only child is the
 * button — so the row is one Tab stop that announces its expanded state, and the
 * body below it is a sibling rather than something nested inside a control.
 */
export default function ResumeCard({
  logo,
  altText,
  title,
  subtitle,
  summary,
  period,
  href,
  bullets,
  techStack,
  techStackLabel,
  toggleLabel,
  defaultExpanded = false,
}: ResumeCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const reducedMotion = useReducedMotion();
  const bodyId = useId();

  const hasBody = Boolean(bullets?.length || techStack?.length);

  const headerContent = (
    <>
      <span className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="inline-flex items-center font-mono text-base leading-none font-bold">
          {title}
          {hasBody && (
            <ChevronRightIcon
              aria-hidden="true"
              className={cn(
                // Visible at rest, brighter on hover and keyboard focus. It used
                // to fade in from `opacity-0` on hover alone, which is an
                // affordance a phone cannot show at all: a touch reader had no
                // way to tell an expandable role from a plain one.
                "size-4 translate-x-0 transform opacity-60 transition-all duration-300 ease-out group-focus-within:translate-x-1 group-focus-within:opacity-100 group-hover:translate-x-1 group-hover:opacity-100 print:hidden",
                isExpanded ? "rotate-90" : "rotate-0",
              )}
            />
          )}
        </span>
        <span className="font-mono text-sm whitespace-nowrap text-muted-foreground">
          {period}
        </span>
      </span>
      {subtitle && (
        <span className="text-sm font-normal text-foreground">{subtitle}</span>
      )}
      {summary && (
        <span className="text-sm font-normal text-muted-foreground">
          {summary}
        </span>
      )}
    </>
  );

  return (
    <StandardBlock className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2">
      <div className="select-none">
        {/* A static import, so Next reads the file's real dimensions at build
            time and a rename is a build error rather than a silent 404.

            Square, with the block's own 2 px edge: the last round thing on a
            page with no radius would be this logo
            (`docs/design/portfolio-redesign-v2.md` §7, the consequence drawn
            from decisions 5 and 7). */}
        <Image
          src={logo}
          alt={altText}
          width={48}
          height={48}
          className="size-12 border-2 border-border bg-background object-contain print:border"
        />
      </div>

      {/* `min-w-0`: a grid child defaults to `min-width: auto`, which is the
          width of its longest unbreakable content — a monospace period — and
          would push the column, and the page, past a 375 px viewport.

          `col-span-2 sm:col-start-2 sm:col-span-1`: below `sm` the body runs
          the full row under the logo, instead of squeezing into the 291 px
          left after a 48 px logo on every wrapped bullet line; from `sm` it
          sits back in the second column, beside the logo, as today. */}
      <div className="col-span-2 flex min-w-0 flex-col sm:col-span-1 sm:col-start-2">
        <h3 className="w-full">
          {hasBody ? (
            <button
              type="button"
              aria-controls={bodyId}
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex w-full cursor-pointer flex-col gap-0.5 text-left"
            >
              {headerContent}
              {toggleLabel && <span className="sr-only">{toggleLabel}</span>}
            </button>
          ) : (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex w-full flex-col gap-0.5 text-left"
            >
              {headerContent}
            </a>
          )}
        </h3>

        {hasBody && (
          <motion.div
            id={bodyId}
            // The hook the print stylesheet opens every row by: on paper there
            // is no one to click, so a folded role would simply be missing.
            data-slot="resume-card-body"
            // Folded, the body is still in the markup — that is what keeps a
            // crawler reading a role nobody clicked open — but `height: 0` hides
            // it from eyes only. Without `inert` a screen reader would read the
            // bullets of a row that has just announced itself collapsed.
            inert={!isExpanded}
            initial={false}
            animate={{
              opacity: isExpanded ? 1 : 0,
              height: isExpanded ? "auto" : 0,
            }}
            transition={{
              duration: reducedMotion ? 0 : 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-2 overflow-hidden text-body leading-relaxed"
          >
            {bullets && bullets.length > 0 && (
              <ul className="list-inside list-disc space-y-1">
                {bullets.map((bullet) => (
                  <li key={bullet.id}>{bullet.text}</li>
                ))}
              </ul>
            )}
            {techStack && techStack.length > 0 && (
              // A comma-separated list, not chips: in monospace at 14 px a run
              // of names wraps at the commas like any text, where a dozen
              // `whitespace-nowrap` badges would be the first thing to run past
              // a phone's edge.
              <p className="mt-2 font-mono text-sm">
                <span className="font-semibold">{techStackLabel}</span>{" "}
                <span className="text-muted-foreground">
                  {techStack.join(", ")}
                </span>
              </p>
            )}
          </motion.div>
        )}
      </div>
    </StandardBlock>
  );
}
