import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import SectionPreview from "../../common/section-preview";
import MagicCardPreview from "./preview-client/magic-card-preview";

const importCode = `
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@web/ui/shadcn-ui/card";
import { Button } from "@web/ui/shadcn-ui/button";
import { MagicCard } from "@web/ui/animate-ui/magic-card";
import { useTheme } from "next-themes";
`;

const usageCode = `
<Card className="p-0 max-w-sm w-full shadow-none border-none">
  <MagicCard
    gradientColor={theme === "dark" ? "#262626" : "#d9d9d9"}
    className="p-0"
  >
    <CardHeader className="border-b border-border p-4 [.border-b]:pb-4">
      <CardTitle>Magic Card</CardTitle>
      <CardDescription>
        Magic Card is a component that creates a magic card effect.
      </CardDescription>
    </CardHeader>
    <CardContent className="p-4">
      <p>Magic Card Content</p>
    </CardContent>
    <CardFooter className="p-4 border-t border-border [.border-t]:pt-4">
      <Button className="w-full">Button</Button>
    </CardFooter>
  </MagicCard>
</Card>
`;

const MagicCard = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Magic Card" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <MagicCardPreview />
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

export default MagicCard;
