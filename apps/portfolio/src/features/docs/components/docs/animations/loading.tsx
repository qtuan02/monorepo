import { getTranslations } from "next-intl/server";

import { Loading as LoadingComp } from "@monorepo/ui/animate-ui/loading";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

const LoadingPreview = () => (
  <div className="h-40">
    <LoadingComp />
  </div>
);

const importCode = `
import { Loading } from "@monorepo/ui/animate-ui/loading";
`;

const usageCode = `
<Loading />
`;

const Loading = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Loading" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <LoadingPreview />
      </SectionPreview>

      <SectionCode title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionCode>
      <SectionCode title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionCode>
    </LayoutDocs>
  );
};

export default Loading;
