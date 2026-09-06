import { useTranslations } from "next-intl";

import { Badge } from "@monorepo/ui/components/badge";

import BlurFade from "~/features/home/components/blur-fade";
import { SKILL_GROUPS } from "~/features/home/constants/resume";

interface SkillsSectionProps {
  delay: number;
}

/**
 * Five labelled rows, all of them visible at once.
 *
 * Not tabs, which would hide four rows in five from the first read and from a
 * crawler entirely — a CV is read in one pass. The group label is the only
 * translated string here; the names in the chips are product names and read
 * the same in both locales.
 *
 * The chips are labels, not controls. They carry no hover lift and nothing to
 * activate: a chip that rises under the cursor promises a filter that does not
 * exist.
 */
export default function SkillsSection({ delay }: SkillsSectionProps) {
  const t = useTranslations();

  return (
    <section id="skills">
      <div className="flex min-h-0 flex-col gap-y-3">
        <BlurFade delay={delay}>
          <h2 className="text-xl font-bold">{t("portfolio.skills.title")}</h2>
        </BlurFade>
        {/* One fade for the whole block rather than one per chip: at ~30 chips
            the per-chip stagger was the page's dominant motion, and a reader
            waiting for a list to finish arriving is reading nothing. */}
        <BlurFade delay={delay + 0.08}>
          <div className="flex flex-col gap-y-4">
            {SKILL_GROUPS.map((group) => {
              const headingId = `skills-${group.id}`;

              return (
                <div key={group.id} className="flex flex-col gap-y-2">
                  <h3
                    id={headingId}
                    className="text-sm font-medium text-muted-foreground"
                  >
                    {t(`portfolio.skills.groups.${group.id}`)}
                  </h3>
                  {/* Labelled by its own heading, so the row is announced as
                      "Frontend" rather than as a loose run of chips. */}
                  <ul
                    aria-labelledby={headingId}
                    className="flex list-none flex-wrap gap-1.5"
                  >
                    {group.skills.map((skill) => (
                      <li key={skill}>
                        <Badge
                          variant="outline"
                          className="rounded-sm px-2 py-0.5 text-xs whitespace-nowrap md:text-sm"
                        >
                          {skill}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
