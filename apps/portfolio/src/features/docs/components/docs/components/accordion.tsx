import { IDocComponentProps } from "~/types/docs";
import LayoutDocs from "../../common/layout-docs";
import CodeBlock from "../../common/code-block";
import {
  Accordion as AccordionComp,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import SectionDocs from "../../common/section-docs";
import { getTranslations } from "next-intl/server";

const AccordionPreview = () => (
  <AccordionComp
    type="single"
    collapsible
    className="w-full"
    defaultValue="item-1"
  >
    <AccordionItem value="item-1">
      <AccordionTrigger>Trigger 1</AccordionTrigger>
      <AccordionContent>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut consequuntur
        veritatis aliquam earum neque ex, reprehenderit velit laudantium non.
        Dolor nemo consequuntur dolorem tempora esse maxime eum, excepturi
        similique officiis?
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionTrigger>Trigger 2</AccordionTrigger>
      <AccordionContent>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut consequuntur
        veritatis aliquam earum neque ex, reprehenderit velit laudantium non.
        Dolor nemo consequuntur dolorem tempora esse maxime eum, excepturi
        similique officiis?
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-3">
      <AccordionTrigger>Trigger 3</AccordionTrigger>
      <AccordionContent>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut consequuntur
        veritatis aliquam earum neque ex, reprehenderit velit laudantium non.
        Dolor nemo consequuntur dolorem tempora esse maxime eum, excepturi
        similique officiis?
      </AccordionContent>
    </AccordionItem>
  </AccordionComp>
);

const importCode = `
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
`;

const usageCode = `
<Accordion
  type="single"
  collapsible
  className="w-full"
  defaultValue="item-1"
>
  <AccordionItem value="item-1">
    <AccordionTrigger>Trigger 1</AccordionTrigger>
    <AccordionContent>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut consequuntur
      veritatis aliquam earum neque ex, reprehenderit velit laudantium non.
      Dolor nemo consequuntur dolorem tempora esse maxime eum, excepturi
      similique officiis?
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Trigger 2</AccordionTrigger>
    <AccordionContent>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut consequuntur
      veritatis aliquam earum neque ex, reprehenderit velit laudantium non.
      Dolor nemo consequuntur dolorem tempora esse maxime eum, excepturi
      similique officiis?
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>Trigger 3</AccordionTrigger>
    <AccordionContent>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut consequuntur
      veritatis aliquam earum neque ex, reprehenderit velit laudantium non.
      Dolor nemo consequuntur dolorem tempora esse maxime eum, excepturi
      similique officiis?
    </AccordionContent>
  </AccordionItem>
</Accordion>
`;

const Accordion = async (props: IDocComponentProps) => {
  const { locale, slug } = props;

  const t = await getTranslations({ locale, namespace: "Docs" });

  return (
    <LayoutDocs title="Accordion" slug={slug} locale={locale}>
      <SectionDocs title={t("preview")}>
        <div className="border border-gray-200 dark:border-gray-800 rounded-md p-5">
          <AccordionPreview />
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

export default Accordion;
