import { useTranslations } from "next-intl";

import { Badge } from "@monorepo/ui/components/badge";

import BlurFade from "~/features/home/components/blur-fade";
import { SKILLS } from "~/features/home/constants/resume";

interface SkillsSectionProps {
  delay: number;
}

/** Product and language names — data, not copy, so nothing here is translated. */
export default function SkillsSection({ delay }: SkillsSectionProps) {
  const t = useTranslations();

  return (
    <section id="skills">
      <div className="flex min-h-0 flex-col gap-y-3">
        <BlurFade delay={delay}>
          <h2 className="text-xl font-bold">{t("portfolio.skills.title")}</h2>
        </BlurFade>
        <div className="flex flex-wrap gap-1 md:gap-2">
          {SKILLS.map((skill, index) => (
            <BlurFade key={skill} delay={delay + 0.08 + index * 0.05}>
              <Badge className="rounded-sm px-1.5 transition-all duration-300 select-none hover:-translate-y-1 md:px-3 md:py-1">
                {skill}
              </Badge>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
