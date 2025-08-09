import { createTranslator, Messages } from "next-intl";
import Introduction from "../components/docs/get-started/introduction";
import Accordion from "../components/docs/components/accordion";
import { DocItem } from "~/types/docs";

export const getDataDocs = (
  t: ReturnType<typeof createTranslator<Messages, "Docs">>
) => {
  return [
    {
      key: "get-started",
      label: t("Docs.get-started"),
      children: getStartedData(t),
    },
    {
      key: "components",
      label: t("Docs.components"),
      children: getComponentsData(),
    },
  ];
};

export const getStartedData = (
  t: ReturnType<typeof createTranslator<Messages, "Docs">>
): DocItem[] => {
  return [
    {
      key: "introduction",
      label: t("Docs.introduction"),
      href: "/docs/introduction",
      component: Introduction,
    },
  ];
};

export const getComponentsData = (): DocItem[] => {
  return [
    {
      key: "accordion",
      label: "Accordion",
      href: "/docs/accordion",
      component: Accordion,
    },
  ];
};
