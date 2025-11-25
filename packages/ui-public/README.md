# @fe-monorepo/ui

A collection of reusable UI components built with [Radix UI](https://www.radix-ui.com/) and [Tailwind CSS](https://tailwindcss.com/), following the [shadcn/ui](https://ui.shadcn.com/) design pattern.

## Installation

```bash
npm install @fe-monorepo/ui
# or
pnpm add @fe-monorepo/ui
# or
yarn add @fe-monorepo/ui
```

## Prerequisites

This package requires:

- **React** 19 or higher
- **Tailwind CSS** v4.x

## Setup

### 1. Import Styles

Add the following import to your `globals.css` file:

```css
@import "@fe-monorepo/ui/globals.css";
```

### 2. Configure Tailwind CSS

This package uses Tailwind CSS v4 with CSS variables for theming. The theme and CSS variables are already included in the `globals.css` file.

Make sure your `postcss.config.js` is configured to use Tailwind CSS v4:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### 3. Import Styles in Your App

Import your CSS file in your app's entry point (e.g., `app/layout.tsx` for Next.js or `main.tsx` for Vite):

```tsx
import "./globals.css";
```

### 4. Setup Dark Mode (Optional)

If you want dark mode support, install and configure `next-themes`:

```bash
npm install next-themes
```

Then wrap your app with the `ThemeProvider`:

```tsx
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
```

## Usage

Import components from the package:

```tsx
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@fe-monorepo/ui";

export function MyComponent() {
  return (
    <div>
      <Button>Click me</Button>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>Card content</CardContent>
      </Card>
    </div>
  );
}
```

### Import Individual Components

You can also import components individually:

```tsx
import { Button } from "@fe-monorepo/ui/components/button";
import { cn } from "@fe-monorepo/ui/libs/cn";
```

## Available Components

This package includes the following components:

- Accordion
- Alert Dialog
- Aspect Ratio
- Avatar
- Badge
- Breadcrumb
- Button
- Calendar
- Checkbox
- Collapsible
- Command
- Context Menu
- Dialog
- Drawer
- Dropdown Menu
- Form
- Hover Card
- Input
- Input OTP
- Label
- Menubar
- Navigation Menu
- Pagination
- Popover
- Progress
- Radio Group
- Resizable
- Scroll Area
- Select
- Separator
- Sheet
- Skeleton
- Slider
- Sonner (Toast)
- Switch
- Table
- Tabs
- Textarea
- Toggle
- Toggle Group
- Tooltip

## Utilities

### `cn` utility

The package exports a `cn` utility function for merging class names:

```tsx
import { cn } from "@fe-monorepo/ui";

<div className={cn("base-class", condition && "conditional-class")} />;
```

## Customization

The package includes a default theme with CSS variables. All theme variables are defined in the `globals.css` file and can be customized by overriding the CSS variables in your own CSS file.

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/) - Design system inspiration
- [Radix UI Documentation](https://www.radix-ui.com/) - Underlying component primitives
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Styling framework
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-beta) - Latest Tailwind CSS version
- [next-themes Documentation](https://github.com/pacocoursey/next-themes) - Dark mode support

## License

MIT
