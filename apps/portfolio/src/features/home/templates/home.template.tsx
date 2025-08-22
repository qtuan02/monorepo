import NextLink from "~/components/next-link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { SplittingText } from "@web/ui/animate-ui/text-splitting";
import Background from "../components/background";

export default async function HomeTemplate({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "Home",
  });

  return (
    <main className="py-16 space-y-8 px-4 relative h-[calc(100vh-60px)] overflow-x-hidden">
      <div className="flex justify-center">
        <SplittingText
          className="text-gray-500 md:text-lg font-medium text-center"
          text={t("title")}
        />
      </div>
      <div className="flex justify-center">
        <SplittingText
          className="text-3xl md:text-6xl font-bold text-center"
          text={t("subtitle")}
          delay={2500}
          type="words"
        />
      </div>
      <p className="text-6xl md:text-8xl text-center animate-bounce mt-4 mb-10 select-none">
        👋
      </p>
      <div className="flex justify-center gap-x-6">
        <NextLink
          href="/about"
          className="md:text-xl z-1 font-medium px-4 py-2 bg-gradient-to-br from-orange-300 to-orange-500 rounded-lg text-white flex items-center gap-x-1 hover:opacity-80"
        >
          {t("about")}
          <ArrowRight className="md:size-6 size-4" />
        </NextLink>
        <NextLink
          href="/docs"
          className="md:text-xl z-1 font-medium px-4 py-2 bg-gradient-to-br from-orange-300 to-orange-500 rounded-lg text-white flex items-center gap-x-1 hover:opacity-80"
        >
          {t("explore")}
          <ArrowRight className="md:size-6 size-4" />
        </NextLink>
      </div>
      <Background />
    </main>
  );
}
