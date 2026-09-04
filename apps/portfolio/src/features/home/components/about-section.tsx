import { useTranslations } from "next-intl";

import BlurFade from "~/features/home/components/blur-fade";

interface AboutSectionProps {
  delay: number;
}

/** Two paragraphs of prose, each its own message key rather than an array. */
export default function AboutSection({ delay }: AboutSectionProps) {
  const t = useTranslations();

  return (
    <section id="about">
      <div className="space-y-3">
        <BlurFade delay={delay}>
          <h2 className="text-xl font-bold">{t("portfolio.about.title")}</h2>
        </BlurFade>
        <BlurFade delay={delay + 0.08}>
          <div className="max-w-full space-y-2 text-sm text-muted-foreground">
            <p>{t("portfolio.about.experience")}</p>
            <p>{t("portfolio.about.mindset")}</p>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
