"use client";

import type { StaticImageData } from "next/image";
import { useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

import { cn } from "@monorepo/ui/utils/cn";

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
  /** A label such as "Feb 2025 – Feb 2026", already localized. */
  period: string;
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
  href,
  bullets,
  techStack,
  techStackLabel,
  toggleLabel,
  defaultExpanded = false,
}: ResumeCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

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
                "size-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100",
                isExpanded ? "rotate-90" : "rotate-0",
              )}
            />
          )}
        </span>
        <span className="text-right text-xs text-muted-foreground tabular-nums sm:text-sm">
          {period}
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

        {hasBody && (
          <motion.div
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
