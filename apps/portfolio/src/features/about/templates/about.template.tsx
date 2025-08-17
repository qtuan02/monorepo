"use client";

import { useTranslations } from "next-intl";
import AsideLeft from "../components/aside/aside-left";
import ContentRight from "../components/content/content-right";
import { ScrollProgress } from "@repo/ui/animate-ui/progress-scroll";

export default function AboutTemplate() {
  const t = useTranslations("About");

  return (
    <main className="pt-6 md:py-10 space-y-4 md:space-y-8 px-4 relative pb-22 md:pb-6">
      <ScrollProgress
        progressProps={{
          className:
            "bg-gradient-to-r from-orange-200 to-orange-600 top-12 md:top-15",
        }}
      />
      <h1 className="text-2xl md:text-5xl font-bold text-center">
        {t("about_me")}
      </h1>
      <p className="text-sm md:text-lg text-center max-w-2xl mx-auto text-gray-500">
        {t("about_me_description")}
      </p>
      <section className="max-w-6xl mx-auto flex md:flex-row flex-col gap-x-6 gap-y-4">
        <div className="w-full md:w-1/3 flex flex-col gap-y-4 md:gap-y-6 md:sticky top-20 h-fit">
          <AsideLeft />
        </div>
        <div className="w-full md:w-2/3">
          <ContentRight />
        </div>
      </section>
    </main>
  );
}
