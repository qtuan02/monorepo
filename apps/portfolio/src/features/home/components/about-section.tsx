import { useTranslations } from "next-intl";

import SectionHeading from "~/features/home/components/section-heading";

/** Two paragraphs of prose, each its own message key rather than an array. */
export default function AboutSection() {
  const t = useTranslations();

  return (
    <section id="about">
      <div className="space-y-3">
        <SectionHeading>{t("portfolio.about.title")}</SectionHeading>
        <div className="max-w-full space-y-2 text-[15px] leading-relaxed text-muted-foreground">
          <p>{t("portfolio.about.experience")}</p>
          <p>{t("portfolio.about.mindset")}</p>
        </div>
      </div>
    </section>
  );
}
