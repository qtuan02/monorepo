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
import StandardBlock from "~/features/home/components/standard-block";
import { HERO_ACTIONS } from "~/features/home/constants/resume";
import { isExternalPage } from "~/features/home/utils/is-external-page";

/**
 * How the four quick actions dress, on top of the outline variant: mono like
 * every label on the page, and the card's own ground with the ink border —
 * the variant's dark theme would otherwise paint them on `--input`, which is
 * neither the block they sit in nor a colour this page overrides.
 */
// `print:shadow-none`: the outline variant's `shadow-xs` is the one shadow a
// block's own print half does not cover (#120). `h-10 sm:h-8`: a bigger
// target below `sm`, where the actions sit two to a grid cell instead of
// wrapping a flex row — the primitive's own `sm` size (`h-8`) comes back once
// there is room to wrap.
const ACTION_CLASS_NAME =
  "h-10 border-border bg-card font-mono hover:bg-muted sm:h-8 dark:border-border dark:bg-card dark:hover:bg-muted print:shadow-none";

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
 * — `whoami` and the name, `cat role.txt` and the job title, `cat motto.txt`
 * and what drives the work — then the four quick actions, with the portrait
 * cut square at the right edge of the body. No other section wears a title
 * bar; the metaphor is a signature, made once.
 *
 * The current employer is deliberately **not** here (#274): it is the first
 * row of the work history two blocks down, so a hero that names it spends the
 * page's most-read line on something the reader is about to get anyway. What
 * the hero says instead is the one line a recruiter scans for — the title —
 * set as the page's one yellow slab, the treatment the share card gives the
 * name.
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
      {/* The block the redesign gives every section, landing here first with
          the one thing only this block has: a title bar. No padding — the bar
          runs edge to edge and the body below carries its own inset — spelled
          at both breakpoints, because `cn` replaces a utility only under the
          same variant and a bare `p-0` would leave `sm:p-5` standing. The
          shape, and how it prints, flat, is the component's. */}
      <StandardBlock className="p-0 sm:p-0">
        {/* Window chrome: three dots and a path. Pure decoration, hidden from
            assistive technology as a whole, and from paper: the bar is the
            screen's metaphor, not the CV's content. The `data-slot` is the
            name the E2E specs find the window by. */}
        <div
          aria-hidden="true"
          data-slot="terminal-title-bar"
          className="flex items-center gap-3 border-b-2 border-border px-4 py-2 print:hidden"
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

        {/* A grid, not a flex row: below `sm` the avatar spans only this
            first row (it sits beside the name and nothing else), and
            positioning/current/actions each run `col-span-2` — the full
            width neither had to share with a 80px logo. From `sm` the avatar
            spans all four rows again and the three groups fall back to one
            column beside it, which is today's layout unchanged. */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-5 gap-y-4 p-5 sm:gap-x-8 sm:p-6">
          {/* `min-w-0` is what lets the monospace name wrap instead of pushing
              the block past a 375px viewport: a grid item's default minimum
              width is its content's, and a long word in mono is a long word. */}
          <div className="min-w-0 space-y-1">
            <CommandLine>{t("portfolio.hero.commands.whoami")}</CommandLine>
            <h1 className="font-mono text-2xl font-bold tracking-tight [overflow-wrap:anywhere] sm:text-4xl md:text-5xl">
              {t("portfolio.hero.name")}
            </h1>
          </div>

          {/* Square, by className: `Avatar` rounds with a class rather than
              `--radius`, and its root draws its own 1px `after:` ring, so both
              are overridden here rather than in `@monorepo/ui` — this page is
              the one that wants a square portrait. `print:border` thins its
              2px edge the way the block around it thins on paper. */}
          <Avatar className="row-span-1 size-20 shrink-0 rounded-none border-2 border-border select-none after:rounded-none after:border-0 sm:row-span-4 sm:size-28 md:size-36 lg:size-44 print:border">
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

          <div className="col-span-2 min-w-0 space-y-1 sm:col-span-1">
            <CommandLine>{t("portfolio.hero.commands.role")}</CommandLine>
            {/* Set, not filled (#275): the title carries its weight from the
                type — mono, bold, one step under the name — rather than from a
                yellow slab behind it. The yellow now lives in the press, where
                it is motion rather than decoration (see `globals.css`). */}
            <p className="font-mono text-xl font-bold tracking-tight [overflow-wrap:anywhere] sm:text-2xl md:text-3xl">
              {t("portfolio.hero.role")}
            </p>
          </div>

          <div className="col-span-2 min-w-0 space-y-1 sm:col-span-1">
            <CommandLine>{t("portfolio.hero.commands.motto")}</CommandLine>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("portfolio.hero.tagline")}
            </p>
          </div>

          {/* One wrapping row at every width. It was a 2×2 grid below `sm`
              while there were four actions; with three (#275) a grid leaves
              the last one stretched across half the block on its own, which
              reads as a mistake. Wrapping puts Email and GitHub on the first
              line and LinkedIn under them, each at its own width. `h-10`
              below `sm` in `ACTION_CLASS_NAME` is what keeps the touch
              target, now that the grid cell no longer gives it one. */}
          <div className="col-span-2 flex flex-wrap items-center gap-2 pt-1 sm:col-span-1">
            {HERO_ACTIONS.map((action) => {
              const Icon = action.icon;

              return (
                <a
                  key={action.id}
                  href={action.href}
                  {...(isExternalPage(action.href)
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  // Four actions dressed alike (#275). Email used to carry a
                  // yellow fill, and with it a focus ring spelled in the
                  // highlight pair — no yellow clears 3:1 against `--ring` in
                  // the dark theme. Dropping the fill drops that exception too:
                  // every action now takes the primitive's own ring.
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    ACTION_CLASS_NAME,
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {t(`portfolio.hero.actions.${action.id}`)}
                </a>
              );
            })}
            {/* TODO(#275): `PrintCvButton` is parked, not deleted. The owner
                wants this control to hand over a real PDF rather than open the
                browser's print dialog, and the PDF does not exist yet — so the
                button is out of the hero until it does. The component, its
                test, the `portfolio.hero.actions.print` message and the whole
                `@media print` half of `globals.css` all stay: re-rendering one
                line here is what brings it back, and the print stylesheet is
                what any PDF of this page will be generated from anyway. */}
          </div>
        </div>
      </StandardBlock>
    </section>
  );
}
