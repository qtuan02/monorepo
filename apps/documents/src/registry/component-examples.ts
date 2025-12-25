// Component Usage Examples Registry
import type { ComponentType } from "react";

// Import demo components
import AccordionDemo from "../components/demos/components/accordion-demo";
import accordionDemoCode from "../components/demos/components/accordion-demo.tsx?raw";
import AlertDialogDemo from "../components/demos/components/alert-dialog-demo";
import alertDialogDemoCode from "../components/demos/components/alert-dialog-demo.tsx?raw";
import AspectRatioDemo from "../components/demos/components/aspect-ratio-demo";
import aspectRatioDemoCode from "../components/demos/components/aspect-ratio-demo.tsx?raw";
import AvatarDemo from "../components/demos/components/avatar-demo";
import avatarDemoCode from "../components/demos/components/avatar-demo.tsx?raw";
import BadgeDemo from "../components/demos/components/badge-demo";
import badgeDemoCode from "../components/demos/components/badge-demo.tsx?raw";
import BreadcrumbDemo from "../components/demos/components/breadcrumb-demo";
import breadcrumbDemoCode from "../components/demos/components/breadcrumb-demo.tsx?raw";
import ButtonDemo from "../components/demos/components/button-demo";
import buttonDemoCode from "../components/demos/components/button-demo.tsx?raw";
import CalendarDemo from "../components/demos/components/calendar-demo";
import calendarDemoCode from "../components/demos/components/calendar-demo.tsx?raw";
import CardDemo from "../components/demos/components/card-demo";
import cardDemoCode from "../components/demos/components/card-demo.tsx?raw";
import CheckboxDemo from "../components/demos/components/checkbox-demo";
import checkboxDemoCode from "../components/demos/components/checkbox-demo.tsx?raw";
import CollapsibleDemo from "../components/demos/components/collapsible-demo";
import collapsibleDemoCode from "../components/demos/components/collapsible-demo.tsx?raw";
import CommandDemo from "../components/demos/components/command-demo";
import commandDemoCode from "../components/demos/components/command-demo.tsx?raw";
import ContextMenuDemo from "../components/demos/components/context-menu-demo";
import contextMenuDemoCode from "../components/demos/components/context-menu-demo.tsx?raw";
import DialogDemo from "../components/demos/components/dialog-demo";
import dialogDemoCode from "../components/demos/components/dialog-demo.tsx?raw";
import DrawerDemo from "../components/demos/components/drawer-demo";
import drawerDemoCode from "../components/demos/components/drawer-demo.tsx?raw";
import DropdownMenuDemo from "../components/demos/components/dropdown-menu-demo";
import dropdownMenuDemoCode from "../components/demos/components/dropdown-menu-demo.tsx?raw";
import FormDemo from "../components/demos/components/form-demo";
import formDemoCode from "../components/demos/components/form-demo.tsx?raw";
import HoverCardDemo from "../components/demos/components/hover-card-demo";
import hoverCardDemoCode from "../components/demos/components/hover-card-demo.tsx?raw";
import InputDemo from "../components/demos/components/input-demo";
import inputDemoCode from "../components/demos/components/input-demo.tsx?raw";
import InputOTPDemo from "../components/demos/components/input-otp-demo";
import inputOTPDemoCode from "../components/demos/components/input-otp-demo.tsx?raw";
import LabelDemo from "../components/demos/components/label-demo";
import labelDemoCode from "../components/demos/components/label-demo.tsx?raw";
import MenubarDemo from "../components/demos/components/menubar-demo";
import menubarDemoCode from "../components/demos/components/menubar-demo.tsx?raw";
import NavigationMenuDemo from "../components/demos/components/navigation-menu-demo";
import navigationMenuDemoCode from "../components/demos/components/navigation-menu-demo.tsx?raw";
import PaginationDemo from "../components/demos/components/pagination-demo";
import paginationDemoCode from "../components/demos/components/pagination-demo.tsx?raw";
import PopoverDemo from "../components/demos/components/popover-demo";
import popoverDemoCode from "../components/demos/components/popover-demo.tsx?raw";
import ProgressDemo from "../components/demos/components/progress-demo";
import progressDemoCode from "../components/demos/components/progress-demo.tsx?raw";
import RadioGroupDemo from "../components/demos/components/radio-group-demo";
import radioGroupDemoCode from "../components/demos/components/radio-group-demo.tsx?raw";
import ResizableDemo from "../components/demos/components/resizable-demo";
import resizableDemoCode from "../components/demos/components/resizable-demo.tsx?raw";
import ScrollAreaDemo from "../components/demos/components/scroll-area-demo";
import scrollAreaDemoCode from "../components/demos/components/scroll-area-demo.tsx?raw";
import SelectDemo from "../components/demos/components/select-demo";
import selectDemoCode from "../components/demos/components/select-demo.tsx?raw";
import SeparatorDemo from "../components/demos/components/separator-demo";
import separatorDemoCode from "../components/demos/components/separator-demo.tsx?raw";
import SheetDemo from "../components/demos/components/sheet-demo";
import sheetDemoCode from "../components/demos/components/sheet-demo.tsx?raw";
import SkeletonDemo from "../components/demos/components/skeleton-demo";
import skeletonDemoCode from "../components/demos/components/skeleton-demo.tsx?raw";
import SliderDemo from "../components/demos/components/slider-demo";
import sliderDemoCode from "../components/demos/components/slider-demo.tsx?raw";
import SonnerDemo from "../components/demos/components/sonner-demo";
import sonnerDemoCode from "../components/demos/components/sonner-demo.tsx?raw";
import SwitchDemo from "../components/demos/components/switch-demo";
import switchDemoCode from "../components/demos/components/switch-demo.tsx?raw";
import TableDemo from "../components/demos/components/table-demo";
import tableDemoCode from "../components/demos/components/table-demo.tsx?raw";
import TabsDemo from "../components/demos/components/tabs-demo";
import tabsDemoCode from "../components/demos/components/tabs-demo.tsx?raw";
import TextareaDemo from "../components/demos/components/textarea-demo";
import textareaDemoCode from "../components/demos/components/textarea-demo.tsx?raw";
import ToggleDemo from "../components/demos/components/toggle-demo";
import toggleDemoCode from "../components/demos/components/toggle-demo.tsx?raw";
import ToggleGroupDemo from "../components/demos/components/toggle-group-demo";
import toggleGroupDemoCode from "../components/demos/components/toggle-group-demo.tsx?raw";
import TooltipDemo from "../components/demos/components/tooltip-demo";
import tooltipDemoCode from "../components/demos/components/tooltip-demo.tsx?raw";

export interface ComponentExample {
  component: ComponentType;
  code: string;
}

export const componentExamples: Record<string, ComponentExample> = {
  accordion: {
    component: AccordionDemo,
    code: accordionDemoCode,
  },
  "alert-dialog": {
    component: AlertDialogDemo,
    code: alertDialogDemoCode,
  },
  "aspect-ratio": {
    component: AspectRatioDemo,
    code: aspectRatioDemoCode,
  },
  avatar: {
    component: AvatarDemo,
    code: avatarDemoCode,
  },
  badge: {
    component: BadgeDemo,
    code: badgeDemoCode,
  },
  breadcrumb: {
    component: BreadcrumbDemo,
    code: breadcrumbDemoCode,
  },
  button: {
    component: ButtonDemo,
    code: buttonDemoCode,
  },
  calendar: {
    component: CalendarDemo,
    code: calendarDemoCode,
  },
  card: {
    component: CardDemo,
    code: cardDemoCode,
  },
  checkbox: {
    component: CheckboxDemo,
    code: checkboxDemoCode,
  },
  collapsible: {
    component: CollapsibleDemo,
    code: collapsibleDemoCode,
  },
  command: {
    component: CommandDemo,
    code: commandDemoCode,
  },
  "context-menu": {
    component: ContextMenuDemo,
    code: contextMenuDemoCode,
  },
  dialog: {
    component: DialogDemo,
    code: dialogDemoCode,
  },
  drawer: {
    component: DrawerDemo,
    code: drawerDemoCode,
  },
  "dropdown-menu": {
    component: DropdownMenuDemo,
    code: dropdownMenuDemoCode,
  },
  form: {
    component: FormDemo,
    code: formDemoCode,
  },
  "hover-card": {
    component: HoverCardDemo,
    code: hoverCardDemoCode,
  },
  "input-otp": {
    component: InputOTPDemo,
    code: inputOTPDemoCode,
  },
  input: {
    component: InputDemo,
    code: inputDemoCode,
  },
  label: {
    component: LabelDemo,
    code: labelDemoCode,
  },
  menubar: {
    component: MenubarDemo,
    code: menubarDemoCode,
  },
  "navigation-menu": {
    component: NavigationMenuDemo,
    code: navigationMenuDemoCode,
  },
  pagination: {
    component: PaginationDemo,
    code: paginationDemoCode,
  },
  popover: {
    component: PopoverDemo,
    code: popoverDemoCode,
  },
  progress: {
    component: ProgressDemo,
    code: progressDemoCode,
  },
  "radio-group": {
    component: RadioGroupDemo,
    code: radioGroupDemoCode,
  },
  resizable: {
    component: ResizableDemo,
    code: resizableDemoCode,
  },
  "scroll-area": {
    component: ScrollAreaDemo,
    code: scrollAreaDemoCode,
  },
  select: {
    component: SelectDemo,
    code: selectDemoCode,
  },
  separator: {
    component: SeparatorDemo,
    code: separatorDemoCode,
  },
  sheet: {
    component: SheetDemo,
    code: sheetDemoCode,
  },
  skeleton: {
    component: SkeletonDemo,
    code: skeletonDemoCode,
  },
  slider: {
    component: SliderDemo,
    code: sliderDemoCode,
  },
  sonner: {
    component: SonnerDemo,
    code: sonnerDemoCode,
  },
  switch: {
    component: SwitchDemo,
    code: switchDemoCode,
  },
  table: {
    component: TableDemo,
    code: tableDemoCode,
  },
  tabs: {
    component: TabsDemo,
    code: tabsDemoCode,
  },
  textarea: {
    component: TextareaDemo,
    code: textareaDemoCode,
  },
  "toggle-group": {
    component: ToggleGroupDemo,
    code: toggleGroupDemoCode,
  },
  toggle: {
    component: ToggleDemo,
    code: toggleDemoCode,
  },
  tooltip: {
    component: TooltipDemo,
    code: tooltipDemoCode,
  },
};
