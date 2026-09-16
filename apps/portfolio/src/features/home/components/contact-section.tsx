import { useTranslations } from "next-intl";

import SectionHeading from "~/features/home/components/section-heading";
import StandardBlock from "~/features/home/components/standard-block";
import { CONTACT_ITEMS } from "~/features/home/constants/resume";
import { isExternalPage } from "~/features/home/utils/is-external-page";

/**
 * The contact lines, in one standard block. Each is an icon, a label and a
 * value; the value is a link only when there is somewhere to go — a birthday
 * and a city are facts, and the legacy `href="#"` on both made them look
 * actionable while doing nothing.
 *
 * The label is new in v2 and is what the monospace half of the typography is
 * for here (`docs/design/portfolio-redesign-v2.md` §7, decision 2): "Email",
 * "GitHub" are field names, the address after each is the value and stays in
 * sans. From `sm` the label sits in a fixed gutter so the values line up down
 * the block; on a 375 px phone the gutter would cost the value a third of the
 * row, so the label goes back to its own width and the row wraps rather than
 * truncates — an email address that does not fit beside its label moves under
 * it whole.
 */
export default function ContactSection() {
  const t = useTranslations();

  return (
    <section id="contact">
      <div className="flex h-full min-h-0 flex-col gap-y-3">
        <SectionHeading>{t("portfolio.contact.title")}</SectionHeading>
        <StandardBlock className="flex flex-1 flex-col gap-y-2">
          {CONTACT_ITEMS.map((item) => {
            const Icon = item.icon;
            const label = t(`portfolio.contact.labels.${item.id}`);
            const value = t(`portfolio.contact.items.${item.id}`);

            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-x-2 gap-y-0.5"
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className="font-mono text-sm text-muted-foreground sm:w-24">
                  {label}
                </span>
                {item.href ? (
                  <a
                    href={item.href}
                    {...(isExternalPage(item.href)
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                    className="text-sm hover:underline"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-sm">{value}</span>
                )}
              </div>
            );
          })}
        </StandardBlock>
      </div>
    </section>
  );
}
