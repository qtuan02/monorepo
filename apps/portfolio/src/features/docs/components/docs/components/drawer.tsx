import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";
import {
  Drawer as DrawerComp,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/components/drawer";
import { Button } from "@repo/ui/components/button";

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
} from "@repo/ui/components/drawer";
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
      <SectionDocs title={t("preview")}>
        <div className="border border-gray-200 dark:border-gray-800 rounded-md p-5">
          <DrawerPreview />
        </div>
      </SectionDocs>

      <SectionDocs title={t("import")}>
        <CodeBlock code={importCode} />
      </SectionDocs>
      <SectionDocs title={t("usage")}>
        <CodeBlock code={usageCode} />
      </SectionDocs>
    </LayoutDocs>
  );
};

export default Drawer;
