import { useTranslations } from "next-intl";

import SectionHeading from "~/features/home/components/section-heading";
import { CONTACT_ITEMS } from "~/features/home/constants/resume";
import { isExternalPage } from "~/features/home/utils/is-external-page";

/**
 * The contact lines. Each is an icon plus one value; the value is a link only
 * when there is somewhere to go — a birthday and a city are facts, and the
 * legacy `href="#"` on both made them look actionable while doing nothing.
 */
export default function ContactSection() {
  const t = useTranslations();

  return (
    <section id="contact">
      <div className="flex min-h-0 flex-col gap-y-3">
        <SectionHeading>{t("portfolio.contact.title")}</SectionHeading>
        <div className="flex flex-col gap-y-2">
          {CONTACT_ITEMS.map((item) => {
            const Icon = item.icon;
            const label = t(`portfolio.contact.items.${item.id}`);

            return (
              <div key={item.id} className="flex items-center gap-x-2">
                <Icon aria-hidden="true" className="size-4" />
                {item.href ? (
                  <a
                    href={item.href}
                    {...(isExternalPage(item.href)
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    {label}
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">{label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
