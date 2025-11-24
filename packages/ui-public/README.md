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
- **CSS Variables** for theming (similar to shadcn/ui)

## Setup

### 1. Configure Tailwind CSS

This package uses Tailwind CSS v4 with CSS variables for theming. You need to configure Tailwind in your project.

#### Option A: Using Tailwind CSS v4 (Recommended)

If you're using Tailwind CSS v4, create or update your `globals.css` file:

```css
@import "tailwindcss";
@import "tw-animate-css";

/* Import your theme CSS variables */
@import "./theme.css";

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
    background-color: var(--background);
    color: var(--foreground);
  }
}
```

#### Option B: Using Tailwind CSS v3

If you're using Tailwind CSS v3, create a `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@fe-monorepo/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
    },
  },
  plugins: [],
};
```

### 2. Setup Theme (CSS Variables)

Create a `theme.css` file (or add to your `globals.css`) with the following CSS variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  --secondary: 0 0% 96.1%;
  --secondary-foreground: 0 0% 9%;
  --muted: 0 0% 96.1%;
  --muted-foreground: 0 0% 45.1%;
  --accent: 0 0% 96.1%;
  --accent-foreground: 0 0% 9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 89.8%;
  --input: 0 0% 89.8%;
  --ring: 0 0% 3.9%;
  --radius: 0.5rem;
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 0 0% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 14.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 0 0% 14.9%;
  --muted-foreground: 0 0% 63.9%;
  --accent: 0 0% 14.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 14.9%;
  --input: 0 0% 14.9%;
  --ring: 0 0% 83.1%;
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
}
```

**Note:** The example above uses HSL format. If you prefer OKLCH (as used in this package), you can use:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... other colors */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... other colors */
}
```

### 3. Import Styles

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

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/) - Design system inspiration
- [Radix UI Documentation](https://www.radix-ui.com/) - Underlying component primitives
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Styling framework
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-beta) - Latest Tailwind CSS version
- [next-themes Documentation](https://github.com/pacocoursey/next-themes) - Dark mode support

## License

MIT
