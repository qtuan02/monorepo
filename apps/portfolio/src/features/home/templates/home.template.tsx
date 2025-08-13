import NextLink from "~/components/next-link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { TextReveal } from "@repo/ui/components/text-reveal";

export default async function HomeTemplate({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "Home",
  });

  return (
    <main className="py-16 space-y-8 px-4 ">
      <p className="text-gray-500 md:text-lg text-center font-medium">
        {t("title")}
      </p>
      <TextReveal
        className="flex-center"
        textClassName="text-3xl md:text-6xl font-bold"
        from="top"
        split="letter"
      >
        {t("subtitle")}
      </TextReveal>
      <p className="text-6xl md:text-8xl text-center animate-bounce mt-4 mb-10 select-none">
        👋
      </p>
      <div className="flex justify-center gap-x-6">
        <NextLink
          href="/about"
          className="md:text-xl font-medium px-4 py-2 bg-orange-500 rounded-lg transition-all duration-400 text-white hover:bg-orange-600 flex items-center gap-x-1"
        >
          {t("about")}
          <ArrowRight className="md:size-6 size-4" />
        </NextLink>
        <NextLink
          href="/docs"
          className="md:text-xl font-medium px-4 py-2 bg-orange-500 rounded-lg transition-all duration-400 text-white hover:bg-orange-600 flex items-center gap-x-1"
        >
          {t("explore")}
          <ArrowRight className="md:size-6 size-4" />
        </NextLink>
      </div>
    </main>
  );
}
