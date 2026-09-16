import { ExternalLinkIcon } from "lucide-react";

import { Badge } from "@monorepo/ui/components/badge";

import type {
  ProjectSource,
  ProjectSourceId,
} from "~/features/home/types/resume";
import { GithubIcon } from "~/components/icons/github-icon";
import StandardBlock from "~/features/home/components/standard-block";

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
  "inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * One project on the CV: a name, what kind of project it is, a two-line pitch,
 * a few bullets, the stack as chips, and the links out — repositories and a
 * live deployment.
 *
 * A `StandardBlock`, the page's one block shape, where v1 composed the `Card`
 * primitive. `Card` ships `ring-1`, `shadow-xs`, `rounded-xl` and its own
 * header/content/footer anatomy; a project on this page wants the 2 px edge
 * and the hard shadow every other block has, and the only anatomy it needs is
 * a column whose links stay at the bottom — `h-full` on the block and `flex-1`
 * on the body are what keep three cards in a row the same height with their
 * footers aligned, however long each pitch runs.
 *
 * Two typefaces, split by what the text is (`docs/design/portfolio-redesign-v2.md`
 * §7, decision 2): the name, the type and the stack are labels and set in
 * monospace; the pitch and the bullets are prose and stay in sans.
 *
 * A link renders only where there is a URL. A "Xem demo" with no href is a dead
 * control a recruiter clicks on; the card's one job is to make the code and the
 * deployment one click away, so nothing here pretends to.
 *
 * Hover washes the ground with `--accent` and presses the block: it sinks half
 * a step toward its shadow and the shadow shortens to match (`pressable` on
 * `StandardBlock`). Not v1's lift — a neubrutalist block is pushed into the
 * page, never floated off it — and a card with links is a thing a reader
 * clicks, which is what the press says.
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
    <StandardBlock
      pressable
      className="flex h-full flex-col gap-4 hover:bg-accent"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          {/* `leading-snug` where a work row's title has `leading-none`: that one
              is a single line beside a chevron; this one sits in a 197 px column
              from `md`, where a longer name wraps and needs a gap. */}
          <h3 className="font-mono text-base leading-snug font-bold">{name}</h3>
          <Badge variant="secondary" className="font-mono">
            {typeLabel}
          </Badge>
        </div>
        {/* 15 px, the same as About's prose and a Work bullet. `ux#67` puts
            the floor for body copy there, and a card is not an exemption: the
            column is narrowest at `md`, which is exactly the width where 12 px
            would be hardest to read. */}
        <p className="text-[15px] leading-relaxed">{description}</p>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {bullets.length > 0 && (
          <ul className="list-inside list-disc space-y-1 text-[15px] leading-relaxed">
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
                <Badge
                  variant="outline"
                  className="font-mono whitespace-nowrap"
                >
                  {tech}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

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
