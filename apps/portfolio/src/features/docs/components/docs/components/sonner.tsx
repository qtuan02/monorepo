import { getTranslations } from "next-intl/server";

import type { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";
import SonnerPreview from "./preview-client/sonner-preview";

const importCode = `
"use client";
import { Button } from "@monorepo/ui/shadcn-ui/button";
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
