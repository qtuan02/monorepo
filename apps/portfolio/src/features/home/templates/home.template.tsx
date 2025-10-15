import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SplittingText } from "@monorepo/ui/animate-ui/text-splitting";

import NextLink from "~/components/next-link";
import Background from "../components/background";

export default async function HomeTemplate({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "Home",
  });

  return (
    <main className="relative h-[calc(100vh-60px)] space-y-8 overflow-x-hidden px-4 py-16">
      <div className="flex justify-center">
        <SplittingText
          className="text-center font-medium text-gray-500 md:text-lg"
          text={t("title")}
        />
      </div>
      <div className="flex justify-center">
        <SplittingText
          className="text-center text-3xl font-bold md:text-6xl"
          text={t("subtitle")}
          delay={2500}
          type="words"
        />
      </div>
      <p className="mb-10 mt-4 animate-bounce select-none text-center text-6xl md:text-8xl">
        👋
      </p>
      <div className="flex justify-center gap-x-6">
        <NextLink
          href="/about"
          className="z-1 group flex items-center gap-x-1 rounded-lg bg-gradient-to-br from-orange-300 to-orange-500 px-4 py-2 font-medium text-white opacity-90 hover:opacity-80 md:text-xl"
        >
          {t("about")}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 md:size-6" />
        </NextLink>
        <NextLink
          href="/docs"
          className="z-1 group flex items-center gap-x-1 rounded-lg bg-gradient-to-br from-orange-300 to-orange-500 px-4 py-2 font-medium text-white opacity-90 hover:opacity-80 md:text-xl"
        >
          {t("explore")}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 md:size-6" />
        </NextLink>
      </div>
      <Background />
    </main>
  );
}
