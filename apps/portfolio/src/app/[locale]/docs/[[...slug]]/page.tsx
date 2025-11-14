import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import type { NextParams } from "~/types/common";
import DocsTemplate from "~/features/docs/templates/docs.template";
import { getDataDocs } from "~/features/docs/utils/get-data-docs";
import { routing } from "~/i18n/routing";
import { getMetadataDefault } from "~/utils/get-metadata-default";

export async function generateStaticParams() {
  const locales = routing.locales;
  const docs = getDataDocs().flatMap((doc) => doc.children);

  return locales.flatMap((locale) =>
    docs.map((doc) => ({
      locale,
      slug: Array.isArray(doc.key) ? doc.key : [doc.key],
    })),
  );
}

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

  const docs = getDataDocs().flatMap((doc) => doc.children);
  const doc = docs.find((doc) => doc.key === (slug?.[0] ?? "introduction"));

  if (!doc) notFound();

  return <DocsTemplate locale={locale} slug={slug} />;
}
