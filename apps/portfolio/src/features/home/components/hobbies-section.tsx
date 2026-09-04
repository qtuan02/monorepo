import { useTranslations } from "next-intl";

import BlurFade from "~/features/home/components/blur-fade";
import { HOBBY_ITEMS } from "~/features/home/constants/resume";

interface HobbiesSectionProps {
  delay: number;
}

/** The closing column beside the contact lines — icon plus label, no links. */
export default function HobbiesSection({ delay }: HobbiesSectionProps) {
  const t = useTranslations();

  return (
    <section id="hobbies">
      <div className="flex min-h-0 flex-col gap-y-3">
        <BlurFade delay={delay}>
          <h2 className="text-xl font-bold">{t("portfolio.hobbies.title")}</h2>
        </BlurFade>
        <div className="flex flex-col gap-y-2">
          {HOBBY_ITEMS.map((item, index) => {
            const Icon = item.icon;

            return (
              <BlurFade key={item.id} delay={delay + 0.08 + index * 0.05}>
                <div className="flex items-center gap-x-2">
                  <Icon aria-hidden="true" className="size-4" />
                  <span className="text-xs text-muted-foreground md:text-sm">
                    {t(`portfolio.hobbies.items.${item.id}`)}
                  </span>
                </div>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
