import { useTranslations } from "next-intl";

import ProjectCard from "~/features/home/components/project-card";
import SectionHeading from "~/features/home/components/section-heading";
import {
  PROJECT_ITEMS,
  PROJECT_SOURCE_LABEL_KEYS,
} from "~/features/home/constants/resume";

/**
 * The personal projects — the part of the CV a recruiter can verify against
 * real code. Same join as the work history: structure from the constants,
 * every string from the catalogue, keyed by the item's id.
 *
 * Two across from `sm`, and a lone last card spans both tracks. v2 first
 * kept v1's three-across, which on the 2xl column squeezed each card into
 * ~200 px (#123); in the 2/3 column the page has from `lg` two tracks are
 * ~340 px each, and the third card — an odd one out in a two-column grid —
 * takes the full row rather than leaving a hole beside it. The copy stays
 * capped at two lines and three bullets so the cards read at one height.
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:[&>*:last-child:nth-child(odd)]:col-span-2">
          {PROJECT_ITEMS.map((item) => (
            <ProjectCard
              key={item.id}
              name={item.name}
              typeLabel={t(`portfolio.projects.type.${item.type}`)}
              description={t(`portfolio.projects.items.${item.id}.description`)}
              bullets={item.bulletKeys.map((key) => ({
                id: key,
                text: t(`portfolio.projects.items.${item.id}.bullets.${key}`),
              }))}
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
