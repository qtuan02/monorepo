import { useTranslations } from "next-intl";

import ProjectRow from "~/features/home/components/project-row";
import SectionHeading from "~/features/home/components/section-heading";
import StandardBlock from "~/features/home/components/standard-block";
import {
  PROJECT_ITEMS,
  PROJECT_SOURCE_LABEL_KEYS,
} from "~/features/home/constants/resume";

/**
 * The learning and demo projects — the part of the CV a recruiter can verify
 * against real code, and no more than that. Same join as the work history:
 * structure from the constants, every string from the catalogue, keyed by the
 * item's id.
 *
 * One block for the whole section, three rows inside it, and a note up front
 * saying what these are (#125). The v2 section was three cards, each the size
 * of a work role, which put a demo built to try a stack on the same footing as
 * a year of shipping to a hospital — and the owner's brief is the opposite:
 * these are worth a link, not a pitch. The rows are divided by the page's own
 * 2px rule, so the block reads as one list.
 */
export default function ProjectsSection() {
  const t = useTranslations();

  const sourceLabels = {
    repo: t(PROJECT_SOURCE_LABEL_KEYS.repo),
    frontend: t(PROJECT_SOURCE_LABEL_KEYS.frontend),
    backend: t(PROJECT_SOURCE_LABEL_KEYS.backend),
  };

  return (
    <section id="projects">
      <div className="flex min-h-0 flex-col gap-y-3">
        <SectionHeading>{t("portfolio.projects.title")}</SectionHeading>
        <StandardBlock className="flex flex-col gap-y-4">
          {/* 15 px like every line of prose on the page; muted because it
              frames the list rather than belonging to any item in it. */}
          <p className="text-body leading-relaxed text-muted-foreground">
            {t("portfolio.projects.note")}
          </p>
          <ul className="flex list-none flex-col divide-y-2 divide-border">
            {PROJECT_ITEMS.map((item) => (
              <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                <ProjectRow
                  name={item.name}
                  description={t(
                    `portfolio.projects.items.${item.id}.description`,
                  )}
                  techStack={item.techStack}
                  source={item.source}
                  demo={item.demo}
                  sourceLabels={sourceLabels}
                  demoLabel={t("portfolio.projects.links.demo")}
                />
              </li>
            ))}
          </ul>
        </StandardBlock>
      </div>
    </section>
  );
}
