import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NextParams } from "~/types/common";
import { getMetadataDefault } from "~/utils/get-metadata-default";
import DocsTemplate from "~/features/docs/templates/docs.template";
import { getDataDocs } from "~/features/docs/utils/get-data-docs";

export async function generateMetadata({
  params,
}: {
  params: NextParams;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale });
  const doc = getDataDocs(t)
    .flatMap((doc) => doc.children)
    .find((doc) => doc.key === slug?.[0]);

  return getMetadataDefault(locale, {
    title: doc?.label || t("Docs.title"),
    description: doc?.label || t("Docs.description"),
    openGraph: {
      title: doc?.label || t("Docs.title"),
      description: doc?.label || t("Docs.description"),
    },
    twitter: {
      title: doc?.label || t("Docs.title"),
      description: doc?.label || t("Docs.description"),
    },
  });
}

export default async function DocsPage({ params }: { params: NextParams }) {
  const { locale, slug } = await params;

  return <DocsTemplate locale={locale} slug={slug} />;
}
