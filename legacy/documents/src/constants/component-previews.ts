// Component Usage Examples Registry
import type { ComponentType } from "react";

// Import preview components
import AccordionPreview from "../components/previews/components/accordion-preview";
import accordionPreviewCode from "../components/previews/components/accordion-preview.tsx?raw";
import AlertDialogPreview from "../components/previews/components/alert-dialog-preview";
import alertDialogPreviewCode from "../components/previews/components/alert-dialog-preview.tsx?raw";
import AspectRatioPreview from "../components/previews/components/aspect-ratio-preview";
import aspectRatioPreviewCode from "../components/previews/components/aspect-ratio-preview.tsx?raw";
import AvatarPreview from "../components/previews/components/avatar-preview";
import avatarPreviewCode from "../components/previews/components/avatar-preview.tsx?raw";
import BadgePreview from "../components/previews/components/badge-preview";
import badgePreviewCode from "../components/previews/components/badge-preview.tsx?raw";
import BreadcrumbPreview from "../components/previews/components/breadcrumb-preview";
import breadcrumbPreviewCode from "../components/previews/components/breadcrumb-preview.tsx?raw";
import ButtonPreview from "../components/previews/components/button-preview";
import buttonPreviewCode from "../components/previews/components/button-preview.tsx?raw";
import CalendarPreview from "../components/previews/components/calendar-preview";
import calendarPreviewCode from "../components/previews/components/calendar-preview.tsx?raw";
import CardPreview from "../components/previews/components/card-preview";
import cardPreviewCode from "../components/previews/components/card-preview.tsx?raw";
import CheckboxPreview from "../components/previews/components/checkbox-preview";
import checkboxPreviewCode from "../components/previews/components/checkbox-preview.tsx?raw";
import CollapsiblePreview from "../components/previews/components/collapsible-preview";
import collapsiblePreviewCode from "../components/previews/components/collapsible-preview.tsx?raw";
import CommandPreview from "../components/previews/components/command-preview";
import commandPreviewCode from "../components/previews/components/command-preview.tsx?raw";
import ContextMenuPreview from "../components/previews/components/context-menu-preview";
import contextMenuPreviewCode from "../components/previews/components/context-menu-preview.tsx?raw";
import DialogPreview from "../components/previews/components/dialog-preview";
import dialogPreviewCode from "../components/previews/components/dialog-preview.tsx?raw";
import DrawerPreview from "../components/previews/components/drawer-preview";
import drawerPreviewCode from "../components/previews/components/drawer-preview.tsx?raw";
import DropdownMenuPreview from "../components/previews/components/dropdown-menu-preview";
import dropdownMenuPreviewCode from "../components/previews/components/dropdown-menu-preview.tsx?raw";
import FormPreview from "../components/previews/components/form-preview";
import formPreviewCode from "../components/previews/components/form-preview.tsx?raw";
import HoverCardPreview from "../components/previews/components/hover-card-preview";
import hoverCardPreviewCode from "../components/previews/components/hover-card-preview.tsx?raw";
import InputOTPPreview from "../components/previews/components/input-otp-preview";
import inputOTPPreviewCode from "../components/previews/components/input-otp-preview.tsx?raw";
import InputPreview from "../components/previews/components/input-preview";
import inputPreviewCode from "../components/previews/components/input-preview.tsx?raw";
import LabelPreview from "../components/previews/components/label-preview";
import labelPreviewCode from "../components/previews/components/label-preview.tsx?raw";
import MenubarPreview from "../components/previews/components/menubar-preview";
import menubarPreviewCode from "../components/previews/components/menubar-preview.tsx?raw";
import NavigationMenuPreview from "../components/previews/components/navigation-menu-preview";
import navigationMenuPreviewCode from "../components/previews/components/navigation-menu-preview.tsx?raw";
import PaginationPreview from "../components/previews/components/pagination-preview";
import paginationPreviewCode from "../components/previews/components/pagination-preview.tsx?raw";
import PopoverPreview from "../components/previews/components/popover-preview";
import popoverPreviewCode from "../components/previews/components/popover-preview.tsx?raw";
import ProgressPreview from "../components/previews/components/progress-preview";
import progressPreviewCode from "../components/previews/components/progress-preview.tsx?raw";
import RadioGroupPreview from "../components/previews/components/radio-group-preview";
import radioGroupPreviewCode from "../components/previews/components/radio-group-preview.tsx?raw";
import ResizablePreview from "../components/previews/components/resizable-preview";
import resizablePreviewCode from "../components/previews/components/resizable-preview.tsx?raw";
import ScrollAreaPreview from "../components/previews/components/scroll-area-preview";
import scrollAreaPreviewCode from "../components/previews/components/scroll-area-preview.tsx?raw";
import SelectPreview from "../components/previews/components/select-preview";
import selectPreviewCode from "../components/previews/components/select-preview.tsx?raw";
import SeparatorPreview from "../components/previews/components/separator-preview";
import separatorPreviewCode from "../components/previews/components/separator-preview.tsx?raw";
import SheetPreview from "../components/previews/components/sheet-preview";
import sheetPreviewCode from "../components/previews/components/sheet-preview.tsx?raw";
import SkeletonPreview from "../components/previews/components/skeleton-preview";
import skeletonPreviewCode from "../components/previews/components/skeleton-preview.tsx?raw";
import SliderPreview from "../components/previews/components/slider-preview";
import sliderPreviewCode from "../components/previews/components/slider-preview.tsx?raw";
import SonnerPreview from "../components/previews/components/sonner-preview";
import sonnerPreviewCode from "../components/previews/components/sonner-preview.tsx?raw";
import SwitchPreview from "../components/previews/components/switch-preview";
import switchPreviewCode from "../components/previews/components/switch-preview.tsx?raw";
import TablePreview from "../components/previews/components/table-preview";
import tablePreviewCode from "../components/previews/components/table-preview.tsx?raw";
import TabsPreview from "../components/previews/components/tabs-preview";
import tabsPreviewCode from "../components/previews/components/tabs-preview.tsx?raw";
import TextareaPreview from "../components/previews/components/textarea-preview";
import textareaPreviewCode from "../components/previews/components/textarea-preview.tsx?raw";
import ToggleGroupPreview from "../components/previews/components/toggle-group-preview";
import toggleGroupPreviewCode from "../components/previews/components/toggle-group-preview.tsx?raw";
import TogglePreview from "../components/previews/components/toggle-preview";
import togglePreviewCode from "../components/previews/components/toggle-preview.tsx?raw";
import TooltipPreview from "../components/previews/components/tooltip-preview";
import tooltipPreviewCode from "../components/previews/components/tooltip-preview.tsx?raw";

export interface ComponentPreview {
  component: ComponentType;
  code: string;
}

export const componentPreviews: Record<string, ComponentPreview> = {
  accordion: {
    component: AccordionPreview,
    code: accordionPreviewCode,
  },
  "alert-dialog": {
    component: AlertDialogPreview,
    code: alertDialogPreviewCode,
  },
  "aspect-ratio": {
    component: AspectRatioPreview,
    code: aspectRatioPreviewCode,
  },
  avatar: {
    component: AvatarPreview,
    code: avatarPreviewCode,
  },
  badge: {
    component: BadgePreview,
    code: badgePreviewCode,
  },
  breadcrumb: {
    component: BreadcrumbPreview,
    code: breadcrumbPreviewCode,
  },
  button: {
    component: ButtonPreview,
    code: buttonPreviewCode,
  },
  calendar: {
    component: CalendarPreview,
    code: calendarPreviewCode,
  },
  card: {
    component: CardPreview,
    code: cardPreviewCode,
  },
  checkbox: {
    component: CheckboxPreview,
    code: checkboxPreviewCode,
  },
  collapsible: {
    component: CollapsiblePreview,
    code: collapsiblePreviewCode,
  },
  command: {
    component: CommandPreview,
    code: commandPreviewCode,
  },
  "context-menu": {
    component: ContextMenuPreview,
    code: contextMenuPreviewCode,
  },
  dialog: {
    component: DialogPreview,
    code: dialogPreviewCode,
  },
  drawer: {
    component: DrawerPreview,
    code: drawerPreviewCode,
  },
  "dropdown-menu": {
    component: DropdownMenuPreview,
    code: dropdownMenuPreviewCode,
  },
  form: {
    component: FormPreview,
    code: formPreviewCode,
  },
  "hover-card": {
    component: HoverCardPreview,
    code: hoverCardPreviewCode,
  },
  "input-otp": {
    component: InputOTPPreview,
    code: inputOTPPreviewCode,
  },
  input: {
    component: InputPreview,
    code: inputPreviewCode,
  },
  label: {
    component: LabelPreview,
    code: labelPreviewCode,
  },
  menubar: {
    component: MenubarPreview,
    code: menubarPreviewCode,
  },
  "navigation-menu": {
    component: NavigationMenuPreview,
    code: navigationMenuPreviewCode,
  },
  pagination: {
    component: PaginationPreview,
    code: paginationPreviewCode,
  },
  popover: {
    component: PopoverPreview,
    code: popoverPreviewCode,
  },
  progress: {
    component: ProgressPreview,
    code: progressPreviewCode,
  },
  "radio-group": {
    component: RadioGroupPreview,
    code: radioGroupPreviewCode,
  },
  resizable: {
    component: ResizablePreview,
    code: resizablePreviewCode,
  },
  "scroll-area": {
    component: ScrollAreaPreview,
    code: scrollAreaPreviewCode,
  },
  select: {
    component: SelectPreview,
    code: selectPreviewCode,
  },
  separator: {
    component: SeparatorPreview,
    code: separatorPreviewCode,
  },
  sheet: {
    component: SheetPreview,
    code: sheetPreviewCode,
  },
  skeleton: {
    component: SkeletonPreview,
    code: skeletonPreviewCode,
  },
  slider: {
    component: SliderPreview,
    code: sliderPreviewCode,
  },
  sonner: {
    component: SonnerPreview,
    code: sonnerPreviewCode,
  },
  switch: {
    component: SwitchPreview,
    code: switchPreviewCode,
  },
  table: {
    component: TablePreview,
    code: tablePreviewCode,
  },
  tabs: {
    component: TabsPreview,
    code: tabsPreviewCode,
  },
  textarea: {
    component: TextareaPreview,
    code: textareaPreviewCode,
  },
  "toggle-group": {
    component: ToggleGroupPreview,
    code: toggleGroupPreviewCode,
  },
  toggle: {
    component: TogglePreview,
    code: togglePreviewCode,
  },
  tooltip: {
    component: TooltipPreview,
    code: tooltipPreviewCode,
  },
};
