import { useTranslations } from "next-intl";

import SectionHeading from "~/features/home/components/section-heading";
import StandardBlock from "~/features/home/components/standard-block";
import { HOBBY_ITEMS } from "~/features/home/constants/resume";

/**
 * The closing block beside the contact lines — icon plus label, no links. A
 * hobby's name is prose, not a field name, so it stays in sans.
 *
 * One flowing row rather than five stacked lines: each icon+label pair wraps
 * to the next line only when it runs out of room, so five short items read as
 * a strip instead of costing the rail a fifth of its height.
 */
export default function HobbiesSection() {
  const t = useTranslations();

  return (
    <section id="hobbies">
      <div className="flex h-full min-h-0 flex-col gap-y-3">
        <SectionHeading>{t("portfolio.hobbies.title")}</SectionHeading>
        <StandardBlock className="flex flex-1 flex-row flex-wrap items-center gap-x-4 gap-y-2">
          {HOBBY_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.id} className="flex items-center gap-x-2">
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className="text-sm">
                  {t(`portfolio.hobbies.items.${item.id}`)}
                </span>
              </div>
            );
          })}
        </StandardBlock>
      </div>
    </section>
  );
}
