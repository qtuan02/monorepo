import { useTranslations } from "next-intl";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@monorepo/ui/components/avatar";

import avatar from "~/assets/avatar.jpg";
import BlurFade from "~/features/home/components/blur-fade";
import BlurFadeText from "~/features/home/components/blur-fade-text";
import { Lens } from "~/features/home/components/lens";

interface HeroSectionProps {
  delay: number;
}

/**
 * The opening block: the greeting, one line of positioning, and the portrait.
 *
 * A Server Component. The three children that need the browser — the two fades
 * and the lens — are client islands that take their content as `children`, so
 * the words themselves are still in the first HTML.
 */
export default function HeroSection({ delay }: HeroSectionProps) {
  const t = useTranslations();

  return (
    <section id="hero">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <div className="flex justify-between gap-2">
          <div className="flex flex-1 flex-col space-y-1.5">
            <BlurFadeText
              delay={delay}
              className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
              yOffset={8}
              as="h1"
              text={t("portfolio.hero.greeting")}
              postFix={<span className="animate-bounce">👋</span>}
            />
            <BlurFadeText
              className="max-w-[600px] md:text-xl"
              delay={delay}
              text={t("portfolio.hero.subtitle")}
            />
          </div>
          <BlurFade delay={delay}>
            <Avatar className="size-28 border select-none md:size-36">
              <Lens
                zoomFactor={2}
                lensSize={60}
                ariaLabel={t("portfolio.hero.zoomLabel")}
              >
                {/* `avatar.src` rather than a `/public` URL string: the import
                    is what the bundler resolves, hashes and checks. */}
                <AvatarImage
                  alt={t("portfolio.hero.avatarAlt")}
                  src={avatar.src}
                />
              </Lens>
              <AvatarFallback>HT</AvatarFallback>
            </Avatar>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
