import NextLink from "~/components/next-link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

export default async function HomeTemplate() {
  const t = await getTranslations("home");

  return (
    <main className="py-16 space-y-8">
      <p className="text-gray-600 text-lg text-center font-medium">
        {t("title")}
      </p>
      <p className="text-6xl font-bold text-center">{t("subtitle")}</p>
      <p className="text-8xl text-center animate-bounce mt-4 mb-10 select-none">
        👋
      </p>
      <div className="flex justify-center gap-x-6">
        <NextLink
          href="/about"
          className="text-xl font-medium px-4 py-2 bg-orange-500 rounded-lg transition-all duration-500 text-white hover:bg-orange-600 flex items-center gap-x-1"
        >
          {t("about")}
          <ArrowRight className="size-6" />
        </NextLink>
        <NextLink
          href="/component"
          className="text-xl font-medium px-4 py-2 bg-orange-500 rounded-lg transition-all duration-500 text-white hover:bg-orange-600 flex items-center gap-x-1"
        >
          {t("explore")}
          <ArrowRight className="size-6" />
        </NextLink>
      </div>
    </main>
  );
}
