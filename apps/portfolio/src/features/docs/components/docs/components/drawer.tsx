import { getTranslations } from "next-intl/server";

import { Button } from "@monorepo/ui/shadcn-ui/button";
import {
  DrawerClose,
  Drawer as DrawerComp,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@monorepo/ui/shadcn-ui/drawer";

import { IDocComponentProps } from "~/types/docs";
import CodeBlock from "../../common/code-block";
import LayoutDocs from "../../common/layout-docs";
import SectionCode from "../../common/section-code";
import SectionPreview from "../../common/section-preview";

const DrawerPreview = () => (
  <div className="flex justify-center">
    <DrawerComp>
      <DrawerTrigger asChild>
        <Button variant="outline">Open</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="w-full">
          <DrawerHeader>
            <DrawerTitle>Header</DrawerTitle>
            <DrawerDescription>Description</DrawerDescription>
          </DrawerHeader>
          <div className="text-center">Data Content</div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </DrawerComp>
  </div>
);

const importCode = `
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@monorepo/ui/shadcn-ui/drawer";
`;

const usageCode = `
<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline">Open</Button>
  </DrawerTrigger>
  <DrawerContent>
    <div className="w-full">
      <DrawerHeader>
        <DrawerTitle>Header</DrawerTitle>
        <DrawerDescription>Description</DrawerDescription>
      </DrawerHeader>
      <div className="text-center">Data Content</div>
      <DrawerFooter>
        <DrawerClose asChild>
          <Button variant="outline">Close</Button>
        </DrawerClose>
      </DrawerFooter>
    </div>
  </DrawerContent>
</Drawer>
`;

const Drawer = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Drawer" slug={slug} locale={locale}>
      <SectionPreview title={t("preview")}>
        <DrawerPreview />
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

export default Drawer;
