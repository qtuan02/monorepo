# @fe-monorepo/ui

63 [shadcn](https://ui.shadcn.com) primitives in the `base-vega` style, built on
[Base UI](https://base-ui.com) rather than Radix, published from the
[`monorepo`](https://github.com/qtuan02/monorepo) workspace as ESM with per-file type
declarations. No barrel, no root entry — you import the primitive you need by its own
subpath, so a bundler ships only that file.

> `2.0.0` is a rewrite, not an upgrade. The `1.0.2` line published 42 Radix-based
> components from the pre-Skeleton codebase; this line publishes the current Base UI set.
> Every component's props, composition and state attributes changed — treat it as a new
> package.

## Install

```bash
bun add @fe-monorepo/ui
# npm install @fe-monorepo/ui
```

### Peer dependencies

| Peer | Range |
| --- | --- |
| `react` | `>=19` |
| `react-dom` | `>=19` |
| `tailwindcss` | `^4` |

The package is ESM-only (`"type": "module"`) and ships no CommonJS build. It does **not**
depend on `@fe-monorepo/hook`: the one hook it uses internally is compiled into its own
`dist/`, so installing the UI package pulls in no sibling.

## Set up the stylesheet

Two lines in your Tailwind v4 entry, and one that matters more than it looks:

```css
/* src/index.css */
@import "tailwindcss";
@import "@fe-monorepo/ui/globals.css";

/* Tailwind v4 does not scan node_modules. Without this line every class inside the
   package compiles to nothing and the components render unstyled. Adjust the path so it
   points at the installed package from wherever this file lives. */
@source "../node_modules/@fe-monorepo/ui/dist";
```

`@fe-monorepo/ui/globals.css` is a **fragment**, not a full Tailwind entry: it carries the
theme tokens, the `dark` variant, this package's base layer and the two `data-orientation`
variants the primitives style against — but not `@import "tailwindcss"` itself, which is
yours to own since `tailwindcss` is a peer dependency.

Those two variants are the reason the stylesheet is not optional:

```css
@custom-variant data-horizontal (&[data-orientation="horizontal"]);
@custom-variant data-vertical (&[data-orientation="vertical"]);
```

Base UI states orientation as a *value* attribute (`data-orientation="vertical"`), while
the shadcn registry styles against a bare `data-vertical:`. Without the two variants,
every such utility compiles to no CSS and no error — sliders lose their height, scrollbars
their width, and a tabs list stretches to full height.

## Usage

Every primitive lives at its own subpath, named after its file:

```tsx
import { Button } from "@fe-monorepo/ui/components/button";
import { Field, FieldError, FieldLabel } from "@fe-monorepo/ui/components/field";
import { cn } from "@fe-monorepo/ui/utils/cn";

function SaveRow({ invalid }: { invalid: boolean }) {
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor="name">Name</FieldLabel>
      <Button className={cn("mt-2", invalid && "opacity-50")}>Save</Button>
    </Field>
  );
}
```

There is no `import { Button } from "@fe-monorepo/ui"` — the root entry does not exist.

### Composition is `render`, not `asChild`

Base UI has no `asChild`/`Slot`. To render a primitive as a different element, hand that
element to its `render` prop:

```tsx
<DialogTrigger render={<Button variant="outline">Open</Button>} />
```

The one exception is a link that looks like a button: style the link with
`buttonVariants` instead of rendering it through `Button`, which assumes a native
`<button>`.

```tsx
<a href="/home" className={cn(buttonVariants({ variant: "ghost" }))}>Home</a>
```

### State attributes are bare

`data-open`, `data-closed`, `data-checked`, `data-disabled` — not Radix's
`data-[state=open]`. Orientation is the exception noted above.

## Primitives

Every row is `@fe-monorepo/ui/components/<subpath>`.

| Subpath | Exports |
| --- | --- |
| `accordion` | `Accordion`, `AccordionContent`, `AccordionItem`, `AccordionTrigger` |
| `alert-dialog` | `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogMedia`, `AlertDialogOverlay`, `AlertDialogPortal`, `AlertDialogTitle`, `AlertDialogTrigger` |
| `alert` | `Alert`, `AlertAction`, `AlertDescription`, `AlertTitle` |
| `aspect-ratio` | `AspectRatio` |
| `attachment` | `Attachment`, `AttachmentAction`, `AttachmentActions`, `AttachmentContent`, `AttachmentDescription`, `AttachmentGroup`, `AttachmentMedia`, `AttachmentTitle`, `AttachmentTrigger` |
| `avatar` | `Avatar`, `AvatarBadge`, `AvatarFallback`, `AvatarGroup`, `AvatarGroupCount`, `AvatarImage` |
| `badge` | `Badge`, `badgeVariants` |
| `breadcrumb` | `Breadcrumb`, `BreadcrumbEllipsis`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbList`, `BreadcrumbPage`, `BreadcrumbSeparator` |
| `bubble` | `Bubble`, `BubbleContent`, `BubbleGroup`, `BubbleReactions` |
| `button-group` | `ButtonGroup`, `ButtonGroupSeparator`, `ButtonGroupText`, `buttonGroupVariants` |
| `button` | `Button`, `buttonVariants` |
| `calendar` | `Calendar`, `CalendarDayButton` |
| `card` | `Card`, `CardAction`, `CardContent`, `CardDescription`, `CardFooter`, `CardHeader`, `CardTitle` |
| `carousel` | `Carousel`, `CarouselApi`, `CarouselContent`, `CarouselItem`, `CarouselNext`, `CarouselPrevious`, `useCarousel` |
| `chart` | `ChartContainer`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`, `ChartTooltip`, `ChartTooltipContent` |
| `checkbox` | `Checkbox` |
| `collapsible` | `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` |
| `combobox` | `Combobox`, `ComboboxChip`, `ComboboxChips`, `ComboboxChipsInput`, `ComboboxCollection`, `ComboboxContent`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxInput`, `ComboboxItem`, `ComboboxLabel`, `ComboboxList`, `ComboboxSeparator`, `ComboboxTrigger`, `ComboboxValue`, `useComboboxAnchor` |
| `command` | `Command`, `CommandDialog`, `CommandEmpty`, `CommandGroup`, `CommandInput`, `CommandItem`, `CommandList`, `CommandSeparator`, `CommandShortcut` |
| `context-menu` | `ContextMenu`, `ContextMenuCheckboxItem`, `ContextMenuContent`, `ContextMenuGroup`, `ContextMenuItem`, `ContextMenuLabel`, `ContextMenuPortal`, `ContextMenuRadioGroup`, `ContextMenuRadioItem`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuSub`, `ContextMenuSubContent`, `ContextMenuSubTrigger`, `ContextMenuTrigger` |
| `data-table` | `createDataTableColumnHelper`, `DataTable`, `DataTableColumnHeader`, `DataTableFeatures`, `dataTableFeatures` |
| `date-picker` | `DatePicker`, `DatePickerInput`, `DateRangePicker` |
| `dialog` | `Dialog`, `DialogClose`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogOverlay`, `DialogPortal`, `DialogTitle`, `DialogTrigger` |
| `direction` | `DirectionProvider`, `useDirection` |
| `drawer` | `Drawer`, `DrawerClose`, `DrawerContent`, `DrawerDescription`, `DrawerFooter`, `DrawerHeader`, `DrawerOverlay`, `DrawerPortal`, `DrawerSwipeHandle`, `DrawerTitle`, `DrawerTrigger` |
| `dropdown-menu` | `DropdownMenu`, `DropdownMenuCheckboxItem`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuPortal`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger`, `DropdownMenuTrigger` |
| `empty` | `Empty`, `EmptyContent`, `EmptyDescription`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle` |
| `field` | `Field`, `FieldContent`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLabel`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldTitle` |
| `hover-card` | `HoverCard`, `HoverCardContent`, `HoverCardTrigger` |
| `input-group` | `InputGroup`, `InputGroupAddon`, `InputGroupButton`, `InputGroupInput`, `InputGroupText`, `InputGroupTextarea` |
| `input-otp` | `InputOTP`, `InputOTPGroup`, `InputOTPSeparator`, `InputOTPSlot` |
| `input` | `Input` |
| `item` | `Item`, `ItemActions`, `ItemContent`, `ItemDescription`, `ItemFooter`, `ItemGroup`, `ItemHeader`, `ItemMedia`, `ItemSeparator`, `ItemTitle` |
| `kbd` | `Kbd`, `KbdGroup` |
| `label` | `Label` |
| `marker` | `Marker`, `MarkerContent`, `MarkerIcon`, `markerVariants` |
| `menubar` | `Menubar`, `MenubarCheckboxItem`, `MenubarContent`, `MenubarGroup`, `MenubarItem`, `MenubarLabel`, `MenubarMenu`, `MenubarPortal`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarSeparator`, `MenubarShortcut`, `MenubarSub`, `MenubarSubContent`, `MenubarSubTrigger`, `MenubarTrigger` |
| `message-scroller` | `MessageScroller`, `MessageScrollerButton`, `MessageScrollerContent`, `MessageScrollerItem`, `MessageScrollerProvider`, `MessageScrollerViewport`, `useMessageScroller`, `useMessageScrollerScrollable`, `useMessageScrollerVisibility` |
| `message` | `Message`, `MessageAvatar`, `MessageContent`, `MessageFooter`, `MessageGroup`, `MessageHeader` |
| `native-select` | `NativeSelect`, `NativeSelectOptGroup`, `NativeSelectOption` |
| `navigation-menu` | `NavigationMenu`, `NavigationMenuContent`, `NavigationMenuIndicator`, `NavigationMenuItem`, `NavigationMenuLink`, `NavigationMenuList`, `NavigationMenuPositioner`, `NavigationMenuTrigger`, `navigationMenuTriggerStyle` |
| `pagination` | `Pagination`, `PaginationContent`, `PaginationEllipsis`, `PaginationItem`, `PaginationLink`, `PaginationNext`, `PaginationPrevious` |
| `popover` | `Popover`, `PopoverContent`, `PopoverDescription`, `PopoverHeader`, `PopoverTitle`, `PopoverTrigger` |
| `progress` | `Progress`, `ProgressIndicator`, `ProgressLabel`, `ProgressTrack`, `ProgressValue` |
| `questionnaire` | `Questionnaire`, `QuestionnaireActions`, `QuestionnaireChoice`, `QuestionnaireChoiceDescription`, `QuestionnaireChoices`, `QuestionnaireDescription`, `QuestionnaireError`, `QuestionnaireInput`, `QuestionnaireItem`, `QuestionnaireNext`, `QuestionnairePrevious`, `QuestionnaireProgress`, `QuestionnaireSkip`, `QuestionnaireSubmit`, `QuestionnaireTitle` |
| `radio-group` | `RadioGroup`, `RadioGroupItem` |
| `resizable` | `ResizableHandle`, `ResizablePanel`, `ResizablePanelGroup` |
| `scroll-area` | `ScrollArea`, `ScrollBar` |
| `select` | `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue` |
| `separator` | `Separator` |
| `sheet` | `Sheet`, `SheetClose`, `SheetContent`, `SheetDescription`, `SheetFooter`, `SheetHeader`, `SheetTitle`, `SheetTrigger` |
| `sidebar` | `Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarGroupLabel`, `SidebarHeader`, `SidebarInput`, `SidebarInset`, `SidebarMenu`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuButton`, `SidebarMenuItem`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubButton`, `SidebarMenuSubItem`, `SidebarProvider`, `SidebarRail`, `SidebarSeparator`, `SidebarTrigger`, `useSidebar` |
| `skeleton` | `Skeleton` |
| `slider` | `Slider` |
| `spinner` | `Spinner` |
| `switch` | `Switch` |
| `table` | `Table`, `TableBody`, `TableCaption`, `TableCell`, `TableFooter`, `TableHead`, `TableHeader`, `TableRow` |
| `tabs` | `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`, `tabsListVariants` |
| `textarea` | `Textarea` |
| `toast` | `createToastManager`, `Toast`, `ToastAction`, `ToastClose`, `ToastContent`, `ToastDescription`, `Toaster`, `ToastPortal`, `ToastProvider`, `ToastTitle`, `ToastViewport`, `toast`, `useToastManager` |
| `toggle-group` | `ToggleGroup`, `ToggleGroupItem` |
| `toggle` | `Toggle`, `toggleVariants` |
| `tooltip` | `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` |

## Utilities

| Subpath | Exports |
| --- | --- |
| `@fe-monorepo/ui/utils/cn` | `cn(...inputs)` — `twMerge(clsx(...))`, the merge every primitive uses for its `className` |
| `@fe-monorepo/ui/utils/build-pagination-pages` | `buildPaginationPages(...)` — the page/ellipsis list behind `Pagination` |

## Storybook

Every primitive is previewed, with its variants and props tables, in the workspace's
Storybook: [`apps/storybook`](https://github.com/qtuan02/monorepo/tree/main/apps/storybook).
Run it locally with `bun run dev:storybook` from a clone.

## TypeScript

Each subpath resolves its own `.d.ts`, so `moduleResolution: "Bundler"` (or `"NodeNext"`)
picks up types with no `paths` entry and no `@types/*` package.

## License

MIT
