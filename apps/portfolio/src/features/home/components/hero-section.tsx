import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@monorepo/ui/components/avatar";
import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import avatar from "~/assets/avatar.jpg";
import PrintCvButton from "~/features/home/components/print-cv-button";
import { HERO_ACTIONS } from "~/features/home/constants/resume";
import { isExternalPage } from "~/features/home/utils/is-external-page";

/**
 * How the four quick actions dress, on top of the outline variant: mono like
 * every label on the page, and the card's own ground with the ink border —
 * the variant's dark theme would otherwise paint them on `--input`, which is
 * neither the block they sit in nor a colour this page overrides.
 */
const ACTION_CLASS_NAME =
  "border-border bg-card font-mono hover:bg-muted dark:border-border dark:bg-card dark:hover:bg-muted";

/**
 * What the window's title bar says. A path, the way a shell titles its window
 * — and code, so it is not in the catalogue: the same string in every locale.
 */
const WINDOW_TITLE = "tuan@portfolio:~";

interface CommandLineProps {
  children: ReactNode;
}

/**
 * A prompt and the command typed after it — the line that *introduces* what
 * follows, in the eyes only. The prompt is indigo because that is the accent's
 * role (a link, a prompt, a section number); the command is code and stays
 * English in every language. Neither is content: the whole line is
 * `aria-hidden`, so a screen reader goes straight from the h1 to the
 * positioning without hearing "dollar whoami" first.
 */
function CommandLine({ children }: CommandLineProps) {
  return (
    <p aria-hidden="true" className="font-mono text-sm">
      <span className="text-primary">$</span> {children}
    </p>
  );
}

/**
 * The opening block, dressed as the page's one terminal window: a title bar,
 * then the three things a reader needs in the order a shell would print them
 * — `whoami` and the name, `cat role.txt` and the positioning, the current job
 * — then the four quick actions, with the portrait cut square at the right
 * edge of the body. No other section wears a title bar; the metaphor is a
 * signature, made once.
 *
 * A Server Component. Two children need the browser — the print button, and
 * `Avatar`, which is a client primitive that mounts its `<img>` after its own
 * load check (see the comment on it below); every word a reader sees is in the
 * first HTML.
 */
export default function HeroSection() {
  const t = useTranslations();

  return (
    <section id="hero">
      {/* The block the redesign gives every section — a 2px border in the ink,
          a solid 4px offset shadow in `--hard-shadow`, no radius — landing
          here first, with the one thing only this block has: a title bar.
          `text-foreground` rather than the card pair: `--card-foreground` is
          not one of the two neutrals the app overrides and is still the
          theme's blue-grey in the light theme.

          The `data-slot` is the name the print branch of `src/globals.css`
          flattens the window by — no shadow, a 1px edge — beside every
          `standard-block`; the window is not that component only because of
          the title bar inside it. */}
      <div
        data-slot="terminal-window"
        className="border-2 border-border bg-card text-foreground shadow-[4px_4px_0_0] shadow-hard-shadow"
      >
        {/* Window chrome: three dots and a path. Pure decoration, hidden from
            assistive technology as a whole, and from paper: the same print
            branch hides it by this `data-slot`. */}
        <div
          aria-hidden="true"
          data-slot="terminal-title-bar"
          className="flex items-center gap-3 border-b-2 border-border px-4 py-2"
        >
          <span className="flex gap-1.5">
            <span className="size-3 rounded-full border-2 border-border" />
            <span className="size-3 rounded-full border-2 border-border" />
            <span className="size-3 rounded-full border-2 border-border" />
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {WINDOW_TITLE}
          </span>
        </div>

        <div className="flex items-start gap-5 p-5 sm:gap-8 sm:p-6">
          {/* `min-w-0` is what lets the monospace name wrap instead of pushing
              the block past a 375px viewport: a flex item's minimum width is
              its content's, and a long word in mono is a long word. */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="space-y-1">
              <CommandLine>{t("portfolio.hero.commands.whoami")}</CommandLine>
              <h1 className="font-mono text-2xl font-bold tracking-tight [overflow-wrap:anywhere] sm:text-4xl md:text-5xl">
                {t("portfolio.hero.name")}
              </h1>
            </div>

            <div className="space-y-1">
              <CommandLine>{t("portfolio.hero.commands.role")}</CommandLine>
              <p className="text-base leading-relaxed md:text-lg">
                {t("portfolio.hero.positioning")}
              </p>
            </div>

            <div className="space-y-1">
              <CommandLine>{t("portfolio.hero.commands.current")}</CommandLine>
              <p className="text-[15px] leading-relaxed text-muted-foreground md:text-base">
                {t("portfolio.hero.current")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {HERO_ACTIONS.map((action) => {
                const Icon = action.icon;

                return (
                  <a
                    key={action.id}
                    href={action.href}
                    {...(isExternalPage(action.href)
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      ACTION_CLASS_NAME,
                      // The one yellow control on the page. The primitive's
                      // ring is `--ring`, which in the dark theme no yellow can
                      // clear at 3:1 — so a yellow fill draws its focus ring in
                      // the pair's own text colour, inset, in both themes.
                      // `test/globals.test.ts` pins the ratio that forces this.
                      action.id === "email" &&
                        "bg-highlight text-highlight-foreground hover:bg-highlight hover:text-highlight-foreground focus-visible:border-highlight-foreground focus-visible:ring-2 focus-visible:ring-highlight-foreground focus-visible:ring-inset dark:bg-highlight dark:hover:bg-highlight",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    {t(`portfolio.hero.actions.${action.id}`)}
                  </a>
                );
              })}
              <PrintCvButton className={ACTION_CLASS_NAME} />
            </div>
          </div>

          {/* Square, by className: `Avatar` rounds with a class rather than
              `--radius`, and its root draws its own 1px `after:` ring, so both
              are overridden here rather than in `@monorepo/ui` — this page is
              the one that wants a square portrait. */}
          <Avatar className="size-20 shrink-0 rounded-none border-2 border-border select-none after:rounded-none after:border-0 sm:size-28 md:size-36">
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
            <AvatarImage
              alt={t("portfolio.hero.avatarAlt")}
              src={avatar.src}
              className="rounded-none"
            />
            <AvatarFallback className="rounded-none font-mono">
              HT
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </section>
  );
}
