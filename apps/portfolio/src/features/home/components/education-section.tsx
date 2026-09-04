import { useTranslations } from "next-intl";

import BlurFade from "~/features/home/components/blur-fade";
import { ResumeCard } from "~/features/home/components/resume-card";
import { EDUCATION_ITEMS } from "~/features/home/constants/resume";

interface EducationSectionProps {
  delay: number;
}

/** Same row shape as the work history, without a body to expand. */
export default function EducationSection({ delay }: EducationSectionProps) {
  const t = useTranslations();

  return (
    <section id="education">
      <div className="flex min-h-0 flex-col gap-y-3">
        <BlurFade delay={delay}>
          <h2 className="text-xl font-bold">
            {t("portfolio.education.title")}
          </h2>
        </BlurFade>
        {EDUCATION_ITEMS.map((item, index) => (
          <BlurFade key={item.id} delay={delay + 0.08 + index * 0.05}>
            <ResumeCard
              href={item.href}
              logo={item.logo}
              altText={item.school}
              title={item.school}
              subtitle={t(`portfolio.education.items.${item.id}.degree`)}
              period={t(`portfolio.education.items.${item.id}.period`)}
              toggleLabel={t("portfolio.work.toggle")}
            />
          </BlurFade>
        ))}
      </div>
    </section>
  );
}
