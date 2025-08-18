import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import SonnerPreview from "./preview-client/sonner-preview";

const importCode = `
"use client";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";
`;

const usageCode = `
<Button onClick={() => toast.success("Hello")}>Toast</Button>
`;

const Sonner = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Sonner" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <SonnerPreview />
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

export default Sonner;
