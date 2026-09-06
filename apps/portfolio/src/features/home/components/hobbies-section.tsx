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
        <BlurFade delay={delay + 0.08}>
          <div className="flex flex-col gap-y-2">
            {HOBBY_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.id} className="flex items-center gap-x-2">
                  <Icon aria-hidden="true" className="size-4" />
                  <span className="text-sm text-muted-foreground">
                    {t(`portfolio.hobbies.items.${item.id}`)}
                  </span>
                </div>
              );
            })}
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
