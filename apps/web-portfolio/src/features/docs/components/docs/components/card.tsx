import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionPreview from "../../common/section-preview";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import {
  Card as CardComp,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@web/web-ui/shadcn-ui/card";
import { Button } from "@web/web-ui/shadcn-ui/button";

const CardPreview = () => (
  <div className="flex justify-center">
    <CardComp className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
        <CardAction>
          <Button variant="link">Card Action</Button>
        </CardAction>
      </CardHeader>
      <CardContent>Card Content</CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full">Card Footer</Button>
      </CardFooter>
    </CardComp>
  </div>
);

const importCode = `
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@web/web-ui/shadcn-ui/card";
import { Button } from "@web/web-ui/shadcn-ui/button";
`;

const usageCode = `
<Card className="w-full max-w-sm">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
    <CardAction>
      <Button variant="link">Card Action</Button>
    </CardAction>
  </CardHeader>
  <CardContent>Card Content</CardContent>
  <CardFooter className="flex-col gap-2">
    <Button className="w-full">Card Footer</Button>
  </CardFooter>
</Card>
`;

const Card = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Card" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <CardPreview />
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

export default Card;
