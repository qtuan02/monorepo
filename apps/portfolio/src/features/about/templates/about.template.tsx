import { getTranslations } from "next-intl/server";
import AsideLeft from "../components/aside/aside-left";
import ContentRight from "../components/content/content-right";

export default async function AboutTemplate({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "About",
  });

  return (
    <main className="pt-4 md:py-10 space-y-4 md:space-y-8 px-4 relative pb-22 md:pb-0">
      <h1 className="text-2xl md:text-5xl font-bold text-center">{t("about_me")}</h1>
      <p className="text-sm md:text-lg text-center max-w-2xl mx-auto text-gray-600">
        {t("about_me_description")}
      </p>
      <section className="max-w-6xl mx-auto flex md:flex-row flex-col gap-x-6 gap-y-4">
        <div className="w-full md:w-1/3 flex flex-col gap-y-4 md:gap-y-6 md:sticky top-20 h-fit">
          <AsideLeft locale={locale} />
        </div>
        <div className="w-full md:w-2/3">
          <ContentRight locale={locale} />
        </div>
      </section>
    </main>
  );
}
