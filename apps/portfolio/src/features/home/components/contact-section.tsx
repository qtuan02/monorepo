import { useTranslations } from "next-intl";

import SectionHeading from "~/features/home/components/section-heading";
import StandardBlock from "~/features/home/components/standard-block";
import { CONTACT_ITEMS } from "~/features/home/constants/resume";
import { isExternalPage } from "~/features/home/utils/is-external-page";

/**
 * The contact lines, in one standard block. Each is an icon and a value; the
 * value is a link only when there is somewhere to go — a birthday and a city
 * are facts, and the legacy `href="#"` on both made them look actionable
 * while doing nothing.
 *
 * There is no visible label column any more (#270): a fixed gutter wide
 * enough for "LinkedIn" left too little room for the 36-character value
 * beside it, so that one row wrapped at every desktop width the rail is ever
 * rendered at. The label still exists — `sr-only`, so a screen reader still
 * hears "GitHub github.com/qtuan02" rather than a bare address — it has just
 * left the visible flow a sighted reader scans. The visible text stays
 * exactly the value string; it is never truncated, because the print
 * stylesheet's `#contact a` exemption (`~/globals.css`) reads the URL off
 * that same string.
 *
 * The icon is `size-3.5` here (not the `size-4` Hobbies uses) and the gap is
 * `gap-x-1`, both a notch tighter than elsewhere in the rail — not a style
 * preference, a requirement: at the `lg` breakpoint's narrowest rail (1024
 * px) the label column alone was NOT the whole shortfall. Removing it frees
 * ~104px, but the 36-character LinkedIn value still comes up ~3px short of
 * fitting `size-4` + `gap-x-2`'s remaining width on one line — this trim is
 * what closes that last gap. `e2e/viewport.e2e.ts`'s "one line of text" spec
 * is the regression guard if a translation grows past this margin again.
 */
export default function ContactSection() {
  const t = useTranslations();

  return (
    <section id="contact">
      <div className="flex h-full min-h-0 flex-col gap-y-3">
        <SectionHeading>{t("portfolio.contact.title")}</SectionHeading>
        <StandardBlock className="flex flex-1 flex-col gap-y-3">
          {CONTACT_ITEMS.map((item) => {
            const Icon = item.icon;
            const label = t(`portfolio.contact.labels.${item.id}`);
            const value = t(`portfolio.contact.items.${item.id}`);

            return (
              <div key={item.id} className="flex items-center gap-x-1">
                <Icon aria-hidden="true" className="size-3.5 shrink-0" />
                <span className="sr-only">{label}</span>
                {item.href ? (
                  <a
                    href={item.href}
                    {...(isExternalPage(item.href)
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                    // `py-1 -my-1`: the same 32→28 px hit-area trick as the
                    // project links, sized down since this row already gets
                    // `gap-y-3` from its own parent.
                    className="py-1 -my-1 text-sm hover:underline"
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
