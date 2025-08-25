import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionCode from "../../common/section-code";
import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@web/web-ui/shadcn-ui/card";
import { Button } from "@web/web-ui/shadcn-ui/button";
import { BorderBeam as BorderBeamComp } from "@web/web-ui/animate-ui/border-beam";
import SectionPreview from "../../common/section-preview";

const BorderBeamPreview = () => (
  <div className="flex justify-center">
    <Card className="relative w-[350px] overflow-hidden">
      <CardHeader>
        <CardTitle>Border Beam</CardTitle>
        <CardDescription>
          Border Beam is a component that creates a border beam effect.
        </CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter>
        <Button>Button</Button>
      </CardFooter>
      <BorderBeamComp duration={8} size={100} />
    </Card>
  </div>
);

const importCode = `
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@web/web-ui/shadcn-ui/card";
import { Button } from "@web/web-ui/shadcn-ui/button";
import { BorderBeam } from "@web/web-ui/animate-ui/border-beam";
`;

const usageCode = `
<Card className="relative w-[350px] overflow-hidden">
  <CardHeader>
    <CardTitle>Border Beam</CardTitle>
    <CardDescription>
      Border Beam is a component that creates a border beam effect.
    </CardDescription>
  </CardHeader>
  <CardContent></CardContent>
  <CardFooter>
    <Button>Button</Button>
  </CardFooter>
  <Border duration={8} size={100} />
</Card>
`;

const BorderBeam = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Border Beam" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <BorderBeamPreview />
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

export default BorderBeam;
