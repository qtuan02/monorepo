"use client";

import { useTranslations } from "next-intl";

import { ScrollProgress } from "@monorepo/ui/animate-ui/progress-scroll";

import AsideLeft from "../components/aside/aside-left";
import ContentRight from "../components/content/content-right";

export default function AboutTemplate() {
  const t = useTranslations("About");

  return (
    <main className="relative space-y-4 px-4 pt-6 pb-22 md:space-y-8 md:py-10 md:pb-6">
      <ScrollProgress
        progressProps={{
          className:
            "bg-gradient-to-r from-orange-200 to-orange-600 top-12 md:top-15",
        }}
      />
      <h1 className="text-center text-2xl font-bold md:text-5xl">
        {t("about_me")}
      </h1>
      <p className="mx-auto max-w-2xl text-center text-sm text-gray-500 md:text-lg">
        {t("about_me_description")}
      </p>
      <section className="mx-auto flex max-w-6xl flex-col gap-x-6 gap-y-4 md:flex-row">
        <div className="top-20 flex h-fit w-full flex-col gap-y-4 md:sticky md:w-1/3 md:gap-y-6">
          <AsideLeft />
        </div>
        <div className="w-full md:w-2/3">
          <ContentRight />
        </div>
      </section>
    </main>
  );
}
