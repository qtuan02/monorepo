import { useTranslation } from "react-i18next";

import { SelectLanguage } from "~/components/select/select-language";
import SignInForm from "../components/sign-in-form";
import SignInHero from "../components/sign-in-hero";

export default function SignInTemplate() {
  const { t } = useTranslation();

  return (
    // A split screen instead of a card floating on an empty page: the hero
    // fills the left half at lg+, and below it the form column simply takes
    // the whole viewport.
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <SignInHero />

      <main className="bg-card flex flex-col px-6 py-8 sm:px-10 xl:px-16">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          {/* This is the screen's only title, so it is a real <h1> — the page
              has no other heading for a screen reader to land on. */}
          <div className="flex items-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              {t("auth.signIn.title")}
            </h1>
            {/* This screen renders outside LayoutTemplate (see
              routing-route-guards.md), so it has no header of its own —
              without this, it would be the one screen with no way to switch
              language. `ml-auto` keeps it right-aligned once the brand mark
              beside it drops out at lg. */}
            <SelectLanguage triggerClassName="ml-auto data-[size=default]:h-7 gap-1.5 px-2 text-xs" />
          </div>

          <div className="mt-7">
            <SignInForm />
          </div>

          <p className="text-muted-foreground mt-6 text-center text-xs">
            {t("auth.signIn.support")}
          </p>
        </div>
      </main>
    </div>
  );
}
