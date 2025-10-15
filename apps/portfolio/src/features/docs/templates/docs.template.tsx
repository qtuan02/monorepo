import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getDataDocs, getStartedData } from "../utils/get-data-docs";

interface IDocsTemplateProps {
  locale: string;
  slug?: string[];
}

export default async function DocsTemplate(props: IDocsTemplateProps) {
  const { locale, slug = [] } = props;
  const t = await getTranslations({ locale });

  const defaultComponent = getStartedData(t)[0]?.component ?? null;

  const Component =
    getDataDocs(t)
      .flatMap((doc) => doc.children)
      .find((doc) => doc.key === slug?.[0])?.component ?? defaultComponent;

  if (!Component) notFound();

  return (
    <div className="pb-22 p-4 md:pb-4">
      <Component locale={locale} slug={slug} />
    </div>
  );
}
