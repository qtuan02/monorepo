import { useTranslations } from "next-intl";

import ResumeCard from "~/features/home/components/resume-card";
import SectionHeading from "~/features/home/components/section-heading";
import { WORK_ITEMS } from "~/features/home/constants/resume";

/**
 * The work history. The structure comes from the slice's constants and every
 * string a reader sees comes from the catalogue, joined by the item's id — so a
 * role's copy is translated without the order or the logos being duplicated per
 * language.
 */
export default function WorkSection() {
  const t = useTranslations();

  return (
    <section id="work">
      <div className="flex min-h-0 flex-col gap-y-3">
        <SectionHeading>{t("portfolio.work.title")}</SectionHeading>
        <div className="flex flex-col gap-y-5">
          {WORK_ITEMS.map((item, index) => (
            <ResumeCard
              key={item.id}
              // Progressive disclosure: the current role opens, the earlier
              // ones fold away. Their bullets are still in the markup — the
              // accordion only animates the body's height — so a crawler
              // reads every role either way.
              defaultExpanded={index === 0}
              logo={item.logo}
              altText={item.company}
              title={item.company}
              subtitle={t(`portfolio.work.items.${item.id}.role`)}
              summary={
                item.summary
                  ? t(`portfolio.work.items.${item.id}.summary`)
                  : undefined
              }
              period={t(`portfolio.work.items.${item.id}.period`)}
              bullets={item.bulletKeys.map((key) => ({
                id: key,
                text: t(`portfolio.work.items.${item.id}.bullets.${key}`),
              }))}
              techStack={item.techStack}
              techStackLabel={t("portfolio.work.techStack")}
              toggleLabel={t("portfolio.work.toggle")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
