import { useTranslations } from "next-intl";

import BlurFade from "~/features/home/components/blur-fade";
import { CONTACT_ITEMS } from "~/features/home/constants/resume";
import { isExternalPage } from "~/features/home/utils/is-external-page";

interface ContactSectionProps {
  delay: number;
}

/**
 * The contact lines. Each is an icon plus one value; the value is a link only
 * when there is somewhere to go — a birthday and a city are facts, and the
 * legacy `href="#"` on both made them look actionable while doing nothing.
 */
export default function ContactSection({ delay }: ContactSectionProps) {
  const t = useTranslations();

  return (
    <section id="contact">
      <div className="flex min-h-0 flex-col gap-y-3">
        <BlurFade delay={delay}>
          <h2 className="text-xl font-bold">{t("portfolio.contact.title")}</h2>
        </BlurFade>
        {/* One fade for the block. A fade per line put five animated elements
            in one viewport, where the guideline this pass follows allows two —
            and a list that arrives in sequence is a list nobody reads until it
            has finished arriving. */}
        <BlurFade delay={delay + 0.08}>
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
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
