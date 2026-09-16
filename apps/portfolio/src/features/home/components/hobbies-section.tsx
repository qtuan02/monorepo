import { useTranslations } from "next-intl";

import SectionHeading from "~/features/home/components/section-heading";
import { HOBBY_ITEMS } from "~/features/home/constants/resume";

/** The closing column beside the contact lines — icon plus label, no links. */
export default function HobbiesSection() {
  const t = useTranslations();

  return (
    <section id="hobbies">
      <div className="flex min-h-0 flex-col gap-y-3">
        <SectionHeading>{t("portfolio.hobbies.title")}</SectionHeading>
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
      </div>
    </section>
  );
}
