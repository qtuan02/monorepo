import { useTranslations } from "next-intl";

import BlurFade from "~/features/home/components/blur-fade";
import { ResumeCard } from "~/features/home/components/resume-card";
import { WORK_ITEMS } from "~/features/home/constants/resume";

interface WorkSectionProps {
  delay: number;
}

/**
 * The work history. The structure comes from the slice's constants and every
 * string a reader sees comes from the catalogue, joined by the item's id — so a
 * role's copy is translated without the order or the logos being duplicated per
 * language.
 */
export default function WorkSection({ delay }: WorkSectionProps) {
  const t = useTranslations();

  return (
    <section id="work">
      <div className="flex min-h-0 flex-col gap-y-3">
        <BlurFade delay={delay}>
          <h2 className="text-xl font-bold">{t("portfolio.work.title")}</h2>
        </BlurFade>
        <div className="flex flex-col gap-y-5">
          {WORK_ITEMS.map((item, index) => (
            <BlurFade key={item.id} delay={delay + 0.08 + index * 0.05}>
              <ResumeCard
                defaultExpanded
                logo={item.logo}
                altText={item.company}
                title={item.company}
                subtitle={t(`portfolio.work.items.${item.id}.role`)}
                period={t(`portfolio.work.items.${item.id}.period`)}
                bullets={item.bulletKeys.map((key) => ({
                  id: key,
                  text: t(`portfolio.work.items.${item.id}.bullets.${key}`),
                }))}
                techStack={item.techStack}
                techStackLabel={t("portfolio.work.techStack")}
                toggleLabel={t("portfolio.work.toggle")}
              />
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
