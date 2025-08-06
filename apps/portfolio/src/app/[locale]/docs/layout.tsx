import LayoutDocsTemplate from "~/features/docs/templates/layout-docs.template";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NextParams } from "~/types/common";
import { getMetadataDefault } from "~/utils/get-metadata-default";

export async function generateMetadata({
  params,
}: {
  params: NextParams;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "Docs",
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

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: NextParams;
}) {
  const { locale } = await params;

  return <LayoutDocsTemplate locale={locale}>{children}</LayoutDocsTemplate>;
}
