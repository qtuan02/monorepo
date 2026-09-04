import { useTranslations } from "next-intl";

import BlurFade from "~/features/home/components/blur-fade";
import { CONTACT_ITEMS } from "~/features/home/constants/resume";

interface ContactSectionProps {
  delay: number;
}

/**
 * Only an http(s) destination is a page a new tab can hold. `tel:` and
 * `mailto:` hand off to another application, so `target="_blank"` there opens a
 * blank tab that is left behind — visible on desktop, and on iOS Safari it is
 * the difference between the dialer opening and nothing happening at all.
 */
function isExternalPage(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

/**
 * The contact lines. Each is an icon plus one value; the value is a link only
 * when there is somewhere to go — a birthday and a city are facts, and the
 * legacy `href="#"` on both made them look actionable while doing nothing.
 */
export default function ContactSection({ delay }: ContactSectionProps) {
  const t = useTranslations();

  return (
    <section id="contact" className="flex-1">
      <div className="flex min-h-0 flex-col gap-y-3">
        <BlurFade delay={delay}>
          <h2 className="text-xl font-bold">{t("portfolio.contact.title")}</h2>
        </BlurFade>
        <div className="flex flex-col gap-y-2">
          {CONTACT_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const label = t(`portfolio.contact.items.${item.id}`);

            return (
              <BlurFade key={item.id} delay={delay + 0.08 + index * 0.05}>
                <div className="flex items-center gap-x-2">
                  <Icon aria-hidden="true" className="size-4" />
                  {item.href ? (
                    <a
                      href={item.href}
                      {...(isExternalPage(item.href)
                        ? { target: "_blank", rel: "noreferrer" }
                        : {})}
                      className="text-xs text-muted-foreground hover:underline md:text-sm"
                    >
                      {label}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground md:text-sm">
                      {label}
                    </span>
                  )}
                </div>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
