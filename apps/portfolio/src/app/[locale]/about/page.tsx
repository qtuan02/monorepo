import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import type { NextParams } from "~/types/common";
import AboutTemplate from "~/features/about/templates/about.template";
import { getMetadataDefault } from "~/utils/get-metadata-default";

export async function generateMetadata({
  params,
}: {
  params: NextParams;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "About",
  });

  return getMetadataDefault(locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
    twitter: {
      title: t("title"),
      description: t("description"),
    },
  });
}

export default function AboutPage() {
  return <AboutTemplate />;
}
