import type { LucideProps } from "lucide-react";
import type * as React from "react";
import { CalendarClock, ShieldCheck, Stethoscope } from "lucide-react";
import { useTranslation } from "react-i18next";

// Keyed by id rather than index: the id is also the i18n key, so a reordered
// list can never hand a row the wrong copy (see quality-list-keys.md).
const highlights: { id: string; icon: React.ComponentType<LucideProps> }[] = [
  { id: "records", icon: Stethoscope },
  { id: "schedule", icon: CalendarClock },
  { id: "secure", icon: ShieldCheck },
];

export default function SignInHero() {
  const { t } = useTranslation();

  return (
    // Hidden below lg rather than stacked: on a phone the form is the only
    // thing worth the fold, and a full-bleed brand panel above it would push
    // the fields off-screen.
    <section className="bg-primary text-primary-foreground relative hidden flex-col overflow-hidden p-10 lg:flex xl:p-14">
      {/* Two blurred discs of the panel's own foreground token — depth without
          introducing a second hue, so it holds up in both themes. */}
      <div
        aria-hidden="true"
        className="bg-primary-foreground/15 pointer-events-none absolute -top-32 -right-24 size-96 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="bg-primary-foreground/10 pointer-events-none absolute -bottom-40 -left-28 size-96 rounded-full blur-3xl"
      />

      <span className="relative text-2xl font-bold">{t("common.brand")}</span>

      {/* `my-auto` centres the pitch as one block. `justify-between` would
          instead push the copy and the highlights to opposite ends of a tall
          viewport, which is what left the panel looking half-empty. */}
      <div className="relative my-auto max-w-md py-10">
        <p className="text-3xl leading-snug font-semibold text-balance">
          {t("auth.signIn.hero.tagline")}
        </p>
        <p className="text-primary-foreground/80 mt-4 text-sm leading-relaxed">
          {t("auth.signIn.hero.description")}
        </p>

        <ul className="mt-10 flex flex-col gap-4">
          {highlights.map(({ id, icon: Icon }) => (
            <li key={id} className="flex items-center gap-3">
              <span className="bg-primary-foreground/15 flex size-9 shrink-0 items-center justify-center rounded-lg">
                <Icon className="size-4.5" />
              </span>
              <span className="text-primary-foreground/90 text-sm">
                {t(`auth.signIn.hero.highlights.${id}`)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
