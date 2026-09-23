import { useTranslations } from "next-intl";

import ProjectRow from "~/features/home/components/project-row";
import SectionHeading from "~/features/home/components/section-heading";
import {
  PROJECT_ITEMS,
  PROJECT_SOURCE_LABEL_KEYS,
} from "~/features/home/constants/resume";

/**
 * The personal projects — the part of the CV a recruiter can verify against
 * real code, and no more than that. Same join as the work history: structure
 * from the constants, every string from the catalogue, keyed by the item's
 * id.
 *
 * One standard block per project, same shape as a work role (#269) — not the
 * v2.1 section's single shared block, which read fine at three short rows but
 * ran two longer descriptions into each other the moment the monorepo card
 * dropped to two.
 *
 * No framing note above the blocks (#274): it said the two projects live in a
 * personal monorepo, which every "Mã nguồn" link below already spells out in
 * its own href — a paragraph a reader has to get past to reach the projects,
 * to learn what the projects themselves tell them.
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
        <div className="flex flex-col gap-y-5">
          {PROJECT_ITEMS.map((item) => (
            <ProjectRow
              key={item.id}
              name={item.name}
              description={t(`portfolio.projects.items.${item.id}.description`)}
              techStack={item.techStack}
              source={item.source}
              demo={item.demo}
              sourceLabels={sourceLabels}
              demoLabel={t("portfolio.projects.links.demo")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
