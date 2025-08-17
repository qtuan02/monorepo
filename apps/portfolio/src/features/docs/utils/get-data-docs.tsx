import { createTranslator, Messages } from "next-intl";
import Introduction from "../components/docs/get-started/introduction";
import Accordion from "../components/docs/components/accordion";
import { DocItem } from "~/types/docs";
import ClickOutside from "../components/docs/hooks/click-outside";
import CopyToClipboard from "../components/docs/hooks/copy-to-clipboard";
import IsClient from "../components/docs/hooks/is-client";
import LocalStorage from "../components/docs/hooks/local-storage";
import MediaQuery from "../components/docs/hooks/media-query";
import AspectRatio from "../components/docs/components/aspect-ratio";
import Badge from "../components/docs/components/badge";
import Breadcrumb from "../components/docs/components/breadcrumb";
import Button from "../components/docs/components/button";
import Carousel from "../components/docs/components/carousel";
import Checkbox from "../components/docs/components/checkbox";
import Sortable from "../components/docs/open-source/sortable";
import Table from "../components/docs/components/table";
import DatePicker from "../components/docs/components/date-picker";
import Dialog from "../components/docs/components/dialog";
import Drawer from "../components/docs/components/drawer";
import Form from "../components/docs/components/form";
import HoverCard from "../components/docs/components/hover-card";
import Pagination from "../components/docs/components/pagination";
import Popover from "../components/docs/components/popover";
import Sheet from "../components/docs/components/sheet";
import Skeleton from "../components/docs/components/skeleton";
import Sonner from "../components/docs/components/sonner";
import Tooltip from "../components/docs/components/tooltip";
import Switch from "../components/docs/components/switch";
import BackgroundFireworks from "../components/docs/animations/background-fireworks";
import BackgroundHexagon from "../components/docs/animations/background-hexagon";
import BackgroundHole from "../components/docs/animations/background-hole";
import BackgroundStart from "../components/docs/animations/background-start";
import ElementSpring from "../components/docs/animations/element-spring";
import Loading from "../components/docs/animations/loading";
import ProgressScroll from "../components/docs/animations/progress-scroll";
import TextHighlight from "../components/docs/animations/text-highlight";
import TextRolling from "../components/docs/animations/text-rolling";
import TextSplitting from "../components/docs/animations/text-splitting";
import TextTyping from "../components/docs/animations/text-typing";
import Debounce from "../components/docs/hooks/debounce";
import Previous from "../components/docs/hooks/previous";
import Toggle from "../components/docs/hooks/toggle";
import Unmount from "../components/docs/hooks/unmount";
import Fetch from "../components/docs/hooks/fetch";

export const getDataDocs = (
  t?: ReturnType<typeof createTranslator<Messages, "Docs">>
) => {
  return [
    {
      key: "get-started",
      label: t?.("Docs.get-started") ?? "",
      children: getStartedData(t),
    },
    {
      key: "components",
      label: t?.("Docs.components") ?? "",
      children: getComponentsData(),
    },
    {
      key: "animations",
      label: t?.("Docs.animations") ?? "",
      children: getAnimationsData(),
    },
    {
      key: "open-source",
      label: t?.("Docs.open-source") ?? "",
      children: getOpenSourceData(),
    },
    {
      key: "hooks",
      label: t?.("Docs.hooks") ?? "",
      children: getHooksData(),
    },
  ];
};

export const getStartedData = (
  t?: ReturnType<typeof createTranslator<Messages, "Docs">>
): DocItem[] => {
  return [
    {
      key: "introduction",
      label: t?.("Docs.introduction") ?? "",
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
    {
      key: "aspect-ratio",
      label: "Aspect Ratio",
      href: "/docs/aspect-ratio",
      component: AspectRatio,
    },
    {
      key: "badge",
      label: "Badge",
      href: "/docs/badge",
      component: Badge,
    },
    {
      key: "breadcrumb",
      label: "Breadcrumb",
      href: "/docs/breadcrumb",
      component: Breadcrumb,
    },
    {
      key: "button",
      label: "Button",
      href: "/docs/button",
      component: Button,
    },
    {
      key: "carousel",
      label: "Carousel",
      href: "/docs/carousel",
      component: Carousel,
    },
    {
      key: "checkbox",
      label: "Checkbox",
      href: "/docs/checkbox",
      component: Checkbox,
    },
    {
      key: "date-picker",
      label: "Date Picker",
      href: "/docs/date-picker",
      component: DatePicker,
    },
    {
      key: "dialog",
      label: "Dialog",
      href: "/docs/dialog",
      component: Dialog,
    },
    {
      key: "drawer",
      label: "Drawer",
      href: "/docs/drawer",
      component: Drawer,
    },
    {
      key: "form",
      label: "Form",
      href: "/docs/form",
      component: Form,
    },
    {
      key: "hover-card",
      label: "Hover Card",
      href: "/docs/hover-card",
      component: HoverCard,
    },
    {
      key: "pagination",
      label: "Pagination",
      href: "/docs/pagination",
      component: Pagination,
    },
    {
      key: "popover",
      label: "Popover",
      href: "/docs/popover",
      component: Popover,
    },
    {
      key: "sheet",
      label: "Sheet",
      href: "/docs/sheet",
      component: Sheet,
    },
    {
      key: "skeleton",
      label: "Skeleton",
      href: "/docs/skeleton",
      component: Skeleton,
    },
    {
      key: "sonner",
      label: "Sonner",
      href: "/docs/sonner",
      component: Sonner,
    },
    {
      key: "switch",
      label: "Switch",
      href: "/docs/switch",
      component: Switch,
    },
    {
      key: "table",
      label: "Table",
      href: "/docs/table",
      component: Table,
    },
    {
      key: "tooltip",
      label: "Tooltip",
      href: "/docs/tooltip",
      component: Tooltip,
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

export const getOpenSourceData = (): DocItem[] => {
  return [
    {
      key: "sortable",
      label: "Sortable",
      href: "/docs/sortable",
      component: Sortable,
    },
  ];
};

export const getAnimationsData = (): DocItem[] => {
  return [
    {
      key: "background-fireworks",
      label: "Background Fireworks",
      href: "/docs/background-fireworks",
      component: BackgroundFireworks,
    },
    {
      key: "background-hexagon",
      label: "Background Hexagon",
      href: "/docs/background-hexagon",
      component: BackgroundHexagon,
    },
    {
      key: "background-hole",
      label: "Background Hole",
      href: "/docs/background-hole",
      component: BackgroundHole,
    },
    {
      key: "background-start",
      label: "Background Start",
      href: "/docs/background-start",
      component: BackgroundStart,
    },
    {
      key: "element-spring",
      label: "Element Spring",
      href: "/docs/element-spring",
      component: ElementSpring,
    },
    {
      key: "loading",
      label: "Loading",
      href: "/docs/loading",
      component: Loading,
    },
    {
      key: "progress-scroll",
      label: "Progress Scroll",
      href: "/docs/progress-scroll",
      component: ProgressScroll,
    },
    {
      key: "text-highlight",
      label: "Text Highlight",
      href: "/docs/text-highlight",
      component: TextHighlight,
    },
    {
      key: "text-rolling",
      label: "Text Rolling",
      href: "/docs/text-rolling",
      component: TextRolling,
    },
    {
      key: "text-splitting",
      label: "Text Splitting",
      href: "/docs/text-splitting",
      component: TextSplitting,
    },
    {
      key: "text-typing",
      label: "Text Typing",
      href: "/docs/text-typing",
      component: TextTyping,
    },
  ];
};
