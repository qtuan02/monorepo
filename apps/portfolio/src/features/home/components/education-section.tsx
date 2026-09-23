import { LanguagesIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import ResumeCard from "~/features/home/components/resume-card";
import SectionHeading from "~/features/home/components/section-heading";
import { EDUCATION_ITEMS } from "~/features/home/constants/resume";

/**
 * Same row shape as the work history, without a body to expand.
 *
 * The language line sits inside this same section rather than as a section of
 * its own — it is one fact about the degree, not a new block on the page.
 */
export default function EducationSection() {
  const t = useTranslations();

  return (
    <section id="education">
      <div className="flex min-h-0 flex-col gap-y-3">
        <SectionHeading>{t("portfolio.education.title")}</SectionHeading>
        <div>
          {EDUCATION_ITEMS.map((item) => (
            <ResumeCard
              key={item.id}
              href={item.href}
              logo={item.logo}
              altText={item.school}
              title={item.school}
              subtitle={t(`portfolio.education.items.${item.id}.degree`)}
              period={t(`portfolio.education.items.${item.id}.period`)}
            />
          ))}
        </div>
        <div className="flex items-center gap-x-2 text-sm text-muted-foreground">
          <LanguagesIcon aria-hidden="true" className="size-4 shrink-0" />
          <span>{t("portfolio.education.language")}</span>
        </div>
      </div>
    </section>
  );
}
