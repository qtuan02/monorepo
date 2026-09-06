"use client";

import type { StaticImageData } from "next/image";
import { useId, useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

import { Badge } from "@monorepo/ui/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@monorepo/ui/components/tooltip";
import { cn } from "@monorepo/ui/utils/cn";

/** One body line. `id` is the message-key segment, so it is stable and unique. */
export interface ResumeBullet {
  id: string;
  text: string;
}

/** A prize the row wears next to its period, both halves already localized. */
export interface ResumeAward {
  /** The badge's own text — short enough to sit beside a date range. */
  label: string;
  /**
   * The award's full name. A pointing device reads it in the tooltip; everyone
   * else reads it because the row's toggle is `aria-describedby` it, since the
   * badge itself takes no tab stop — it sits inside the toggle, and a second
   * focusable control nested in a button would be invalid markup.
   */
  tooltip: string;
}

interface ResumeCardProps {
  logo: StaticImageData;
  /** Alt text for the logo — the organisation's own name. */
  altText: string;
  title: string;
  subtitle?: string;
  /** A label such as "Feb 2025 – Feb 2026", already localized. */
  period: string;
  /** Shown beside the period, for the rare row that won something. */
  award?: ResumeAward;
  /** Where the row leads when it has no body of its own to expand. */
  href?: string;
  /** Already-localized body lines, each with the message key it came from. */
  bullets?: readonly ResumeBullet[];
  techStack?: readonly string[];
  /** Prefix in front of the tech-stack list, e.g. "Tech Stack:". */
  techStackLabel?: string;
  /** Accessible name for the expand/collapse control. */
  toggleLabel: string;
  defaultExpanded?: boolean;
}

/**
 * One row of the CV: a logo, a heading line with its period, and — for a role
 * that has one — a body of bullets and a tech stack that folds away.
 *
 * The layout is a bare `<div>` rather than `@monorepo/ui/components/card`, and
 * that is deliberate: `Card` ships `bg-card`, `ring-1`, `shadow-xs`,
 * `rounded-xl`, `overflow-hidden` and its own vertical padding, and a CV row
 * needs none of them. Using the primitive and then switching six of its
 * utilities back off is working against it. The rule this looks like it breaks
 * forbids **re-implementing** a primitive; arranging a slice's own layout with a
 * div is what a div is for.
 *
 * The header is the WAI-ARIA accordion shape — a heading whose only child is the
 * button — so the row is one Tab stop that announces its expanded state, and the
 * body below it is a sibling rather than something nested inside a control.
 */
export function ResumeCard({
  logo,
  altText,
  title,
  subtitle,
  period,
  award,
  href,
  bullets,
  techStack,
  techStackLabel,
  toggleLabel,
  defaultExpanded = false,
}: ResumeCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const bodyId = useId();
  const awardDescriptionId = useId();

  const hasBody = Boolean(bullets?.length || techStack?.length);

  const headerContent = (
    <>
      <span className="flex w-full items-center justify-between gap-x-2">
        <span className="inline-flex items-center text-xs leading-none font-semibold sm:text-sm">
          {title}
          {hasBody && (
            <ChevronRightIcon
              aria-hidden="true"
              className={cn(
                // Visible at rest, brighter on hover and keyboard focus. It used
                // to fade in from `opacity-0` on hover alone, which is an
                // affordance a phone cannot show at all: a touch reader had no
                // way to tell an expandable role from a plain one.
                "size-4 translate-x-0 transform opacity-60 transition-all duration-300 ease-out group-focus-within:translate-x-1 group-focus-within:opacity-100 group-hover:translate-x-1 group-hover:opacity-100",
                isExpanded ? "rotate-90" : "rotate-0",
              )}
            />
          )}
        </span>
        <span className="flex items-center gap-x-2">
          {award && (
            <Tooltip>
              {/* `render`, not `asChild`: Base UI dropped Radix's Slot, and the
                  trigger's own default element is a `<button>` — which cannot
                  be nested inside the accordion header's button. Rendering it
                  as the `Badge` keeps the markup a single control. */}
              <TooltipTrigger
                render={<Badge variant="secondary">{award.label}</Badge>}
              />
              <TooltipContent>{award.tooltip}</TooltipContent>
            </Tooltip>
          )}
          <span className="text-right text-xs text-muted-foreground tabular-nums sm:text-sm">
            {period}
          </span>
        </span>
      </span>
      {subtitle && (
        <span className="text-xs font-normal text-foreground">{subtitle}</span>
      )}
    </>
  );

  return (
    <div className="group flex">
      <div className="flex-none select-none">
        {/* A static import, so Next reads the file's real dimensions at build
            time and a rename is a build error rather than a silent 404. */}
        <Image
          src={logo}
          alt={altText}
          width={48}
          height={48}
          className="size-12 rounded-full border bg-background object-contain"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <h3 className="w-full">
          {hasBody ? (
            <button
              type="button"
              aria-controls={bodyId}
              aria-describedby={award ? awardDescriptionId : undefined}
              aria-expanded={isExpanded}
              aria-label={toggleLabel}
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex w-full cursor-pointer flex-col gap-0.5 text-left"
            >
              {headerContent}
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

        {award && (
          // `aria-label` on the toggle replaces everything inside it, so the
          // badge's own text is never announced — and the tooltip opens on
          // hover, which a phone does not have. This is where the award reaches
          // everyone else: a description is read *in addition* to a name, so it
          // survives that `aria-label`.
          <span className="sr-only" id={awardDescriptionId}>
            {award.tooltip}
          </span>
        )}

        {hasBody && (
          <motion.div
            id={bodyId}
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
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 overflow-hidden text-xs sm:text-sm"
          >
            {bullets && bullets.length > 0 && (
              <ul className="list-inside list-disc space-y-1">
                {bullets.map((bullet) => (
                  <li key={bullet.id}>{bullet.text}</li>
                ))}
              </ul>
            )}
            {techStack && techStack.length > 0 && (
              <p className="mt-2 text-xs sm:text-sm">
                <span className="font-semibold">{techStackLabel}</span>{" "}
                <span className="text-muted-foreground">
                  {techStack.join(", ")}
                </span>
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
