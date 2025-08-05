import { getTranslations } from "next-intl/server";
import AsideLeft from "../components/aside/aside-left";
import ContentRight from "../components/content/content-right";

export default async function AboutTemplate() {
  const t = await getTranslations("About");

  return (
    <main className="py-10 space-y-8 px-4 relative">
      <h1 className="text-5xl font-bold text-center">{t("about_me")}</h1>
      <p className="text-lg text-center max-w-2xl mx-auto text-gray-600">
        {t("about_me_description")}
      </p>
      

      <section className="max-w-6xl mx-auto flex gap-x-6">
        <div className="w-1/3 flex flex-col gap-y-6 sticky top-20 h-fit">
          <AsideLeft />
        </div>
        <div className="w-2/3">
          <ContentRight />
        </div>
      </section>
    </main>
  );
}
