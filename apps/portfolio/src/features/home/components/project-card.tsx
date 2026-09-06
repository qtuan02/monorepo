import { ExternalLinkIcon } from "lucide-react";

import { Badge } from "@monorepo/ui/components/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";

import type {
  ProjectSource,
  ProjectSourceId,
} from "~/features/home/types/resume";
import { GithubIcon } from "~/components/icons/github-icon";

/** One body line. `id` is the message-key segment, so it is stable and unique. */
export interface ProjectBullet {
  id: string;
  text: string;
}

interface ProjectCardProps {
  name: string;
  /** The type badge's text, e.g. "Cá nhân", already localized. */
  typeLabel: string;
  description: string;
  bullets: readonly ProjectBullet[];
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
const linkClassName =
  "inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * One project on the CV: a name, what kind of project it is, a two-line pitch,
 * a few bullets, the stack as chips, and the links out — repositories and a
 * live deployment.
 *
 * Unlike `ResumeCard` this **is** the `Card` primitive: a project wants exactly
 * what the primitive ships — a border, `bg-card`, rounded corners and a footer
 * that stays at the bottom — so composing it costs nothing to undo. `h-full`
 * plus `flex-1` on the content are what keep three cards in a row the same
 * height with their footers aligned, however long each pitch runs.
 *
 * A link renders only where there is a URL. A "Xem demo" with no href is a dead
 * control a recruiter clicks on; the card's one job is to make the code and the
 * deployment one click away, so nothing here pretends to.
 *
 * Hover is translate and shadow only: scaling a card full of small text makes it
 * unreadable for the length of the transition.
 */
export default function ProjectCard({
  name,
  typeLabel,
  description,
  bullets,
  techStack,
  source,
  demo,
  sourceLabels,
  demoLabel,
}: ProjectCardProps) {
  const hasLinks = Boolean(source?.length || demo);

  return (
    <Card
      size="sm"
      className="h-full transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <CardHeader>
        <CardTitle>
          <h3 className="font-semibold">{name}</h3>
        </CardTitle>
        {/* 15 px, the same as About's prose and a Work bullet. `ux#67` puts
            the floor for body copy there, and a card is not an exemption: the
            column is narrowest at `md`, which is exactly the width where 12 px
            would be hardest to read. */}
        <CardDescription className="text-[15px] leading-relaxed">
          {description}
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">{typeLabel}</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex-1">
        {bullets.length > 0 && (
          <ul className="list-inside list-disc space-y-1 text-[15px] leading-relaxed text-muted-foreground">
            {bullets.map((bullet) => (
              <li key={bullet.id}>{bullet.text}</li>
            ))}
          </ul>
        )}
        {techStack.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {techStack.map((tech) => (
              <li key={tech}>
                {/* `Badge` already refuses to wrap; repeated here so the intent
                    survives a primitive re-sync and stays greppable. */}
                <Badge variant="outline" className="whitespace-nowrap">
                  {tech}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      {hasLinks && (
        <CardFooter className="flex-wrap gap-x-4 gap-y-2">
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
        </CardFooter>
      )}
    </Card>
  );
}
