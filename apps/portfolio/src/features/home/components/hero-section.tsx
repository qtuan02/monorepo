import { useTranslations } from "next-intl";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@monorepo/ui/components/avatar";
import { buttonVariants } from "@monorepo/ui/components/button";

import avatar from "~/assets/avatar.jpg";
import PrintCvButton from "~/features/home/components/print-cv-button";
import { HERO_ACTIONS } from "~/features/home/constants/resume";
import { isExternalPage } from "~/features/home/utils/is-external-page";

/**
 * The opening block: the greeting, one line of positioning, and the portrait.
 *
 * A Server Component. The only child that needs the browser is the print
 * button; everything a reader sees is in the first HTML.
 */
export default function HeroSection() {
  const t = useTranslations();

  return (
    <section id="hero">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <div className="flex justify-between gap-2">
          <div className="flex flex-1 flex-col space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
              {t("portfolio.hero.greeting")}
              {/* Decorative text, not an icon. A screen reader announcing
                  "waving hand" after the name adds nothing and interrupts the
                  one line that has to land. `inline-block` because a transform
                  does nothing on an inline element, and the bounce is one. */}
              <span aria-hidden="true" className="inline-block animate-bounce">
                👋
              </span>
            </h1>
            <p className="max-w-[600px] md:text-xl">
              {t("portfolio.hero.positioning")}
            </p>
            <p className="max-w-[600px] text-sm text-muted-foreground md:text-base">
              {t("portfolio.hero.current")}
            </p>
          </div>
          <Avatar className="size-28 border select-none md:size-36">
            {/* `avatar.src` rather than a `/public` URL string: the import is
                what the bundler resolves, hashes and checks.

                Not `next/image`, and not `priority` either — neither would do
                what it looks like. Base UI's `Avatar.Image` runs its own load
                check and mounts the `<img>` only once that resolves, so on the
                server this subtree renders `AvatarFallback` and the portrait
                is not in the first HTML at all. A fetch priority hint on an
                element the browser cannot discover until after hydration buys
                nothing; making this the LCP element means leaving `Avatar`
                behind, which is a design decision rather than a wiring one.
                The box is reserved either way by the root's `size-*`, so
                nothing shifts. */}
            <AvatarImage alt={t("portfolio.hero.avatarAlt")} src={avatar.src} />
            <AvatarFallback>HT</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {HERO_ACTIONS.map((action) => {
            const Icon = action.icon;

            return (
              <a
                key={action.id}
                href={action.href}
                {...(isExternalPage(action.href)
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Icon aria-hidden="true" className="size-4" />
                {t(`portfolio.hero.actions.${action.id}`)}
              </a>
            );
          })}
          <PrintCvButton />
        </div>
      </div>
    </section>
  );
}
