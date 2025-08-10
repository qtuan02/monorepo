import { createTranslator, Messages } from "next-intl";
import Introduction from "../components/docs/get-started/introduction";
import Accordion from "../components/docs/components/accordion";
import { DocItem } from "~/types/docs";
import ClickOutside from "../components/docs/hooks/ClickOutside";
import CopyToClipboard from "../components/docs/hooks/CopyToClipboard";
import Debounce from "../components/docs/hooks/Debounce";
import Fetch from "../components/docs/hooks/Fetch";
import IsClient from "../components/docs/hooks/IsClient";
import LocalStorage from "../components/docs/hooks/LocalStorage";
import MediaQuery from "../components/docs/hooks/MediaQuery";
import Previous from "../components/docs/hooks/Previous";
import Toggle from "../components/docs/hooks/Toggle";
import Unmount from "../components/docs/hooks/Unmount";

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
    {
      key: "hooks",
      label: t("Docs.hooks"),
      children: getHooksData(),
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

export const getHooksData = (): DocItem[] => {
  return [
    {
      key: "use-click-outside",
      label: "useClickOutside",
      href: "/docs/use-click-outside",
      component: ClickOutside,
    },
    {
      key: "use-copy-to-clipboard",
      label: "useCopyToClipboard",
      href: "/docs/use-copy-to-clipboard",
      component: CopyToClipboard,
    },
    {
      key: "use-debounce",
      label: "useDebounce",
      href: "/docs/use-debounce",
      component: Debounce,
    },
    {
      key: "use-fetch",
      label: "useFetch",
      href: "/docs/use-fetch",
      component: Fetch,
    },
    {
      key: "use-is-client",
      label: "useIsClient",
      href: "/docs/use-is-client",
      component: IsClient,
    },
    {
      key: "use-local-storage",
      label: "useLocalStorage",
      href: "/docs/use-local-storage",
      component: LocalStorage,
    },
    {
      key: "use-media-query",
      label: "useMediaQuery",
      href: "/docs/use-media-query",
      component: MediaQuery,
    },
    {
      key: "use-previous",
      label: "usePrevious",
      href: "/docs/use-previous",
      component: Previous,
    },
    {
      key: "use-toggle",
      label: "useToggle",
      href: "/docs/use-toggle",
      component: Toggle,
    },
    {
      key: "use-unmount",
      label: "useUnmount",
      href: "/docs/use-unmount",
      component: Unmount,
    },
  ];
};
