import { useTranslations } from "next-intl";

import BlurFade from "~/features/home/components/blur-fade";
import ProjectCard from "~/features/home/components/project-card";
import {
  PROJECT_ITEMS,
  PROJECT_SOURCE_LABEL_KEYS,
} from "~/features/home/constants/resume";

interface ProjectsSectionProps {
  delay: number;
}

/**
 * The personal projects — the part of the CV a recruiter can verify against
 * real code. Same join as the work history: structure from the constants,
 * every string from the catalogue, keyed by the item's id.
 *
 * Three across from `md` is the grill's call (design §9, decision 9): on the
 * 2xl reading column that makes each card narrow, which is why the card takes
 * `size="sm"` and the copy is capped at two lines and three bullets.
 */
export default function ProjectsSection({ delay }: ProjectsSectionProps) {
  const t = useTranslations();

  const sourceLabels = {
    repo: t(PROJECT_SOURCE_LABEL_KEYS.repo),
    frontend: t(PROJECT_SOURCE_LABEL_KEYS.frontend),
    backend: t(PROJECT_SOURCE_LABEL_KEYS.backend),
  };

  return (
    <section id="projects">
      <div className="flex min-h-0 flex-col gap-y-3">
        <BlurFade delay={delay}>
          <h2 className="text-xl font-bold">{t("portfolio.projects.title")}</h2>
        </BlurFade>
        {/* Three fades where every other section has one. The section-level
            fade was the point of the motion pass — a reader should not wait
            for thirty chips to arrive — but three cards at 50 ms apart is one
            gesture, and it reads as the row filling in rather than as three
            separate entrances. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PROJECT_ITEMS.map((item, index) => (
            // `h-full` on the fade wrapper too, or the card's own `h-full` has
            // nothing to fill and the three footers stop lining up.
            <BlurFade
              key={item.id}
              delay={delay + 0.08 + index * 0.05}
              className="h-full"
            >
              <ProjectCard
                name={item.name}
                typeLabel={t(`portfolio.projects.type.${item.type}`)}
                description={t(
                  `portfolio.projects.items.${item.id}.description`,
                )}
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
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
