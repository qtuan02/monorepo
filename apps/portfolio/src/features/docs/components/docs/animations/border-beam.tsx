import { getTranslations } from "next-intl/server";

import { BorderBeam as BorderBeamComp } from "@monorepo/ui/animate-ui/border-beam";
import { Button } from "@monorepo/ui/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/shadcn-ui/card";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
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
} from "@monorepo/ui/shadcn-ui/card";
import { Button } from "@monorepo/ui/shadcn-ui/button";
import { BorderBeam } from "@monorepo/ui/animate-ui/border-beam";
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
