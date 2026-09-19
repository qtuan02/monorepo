import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { BrandMark } from "~/components/brand/brand-mark";
import { ROUTES } from "~/constants/routes";

/**
 * The catch-all route's own screen (main.tsx — outside the guard, inside the
 * Islands shell), so it already sits on `LayoutTemplate`'s Island; this is
 * its content, not a second Island.
 */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <BrandMark />
      <h1 className="text-2xl font-bold">404 Not Found</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      {/* A navigation link styled as a button — never `Button` itself, which
          assumes a native <button> (see .agents/rules/architecture-ui-
          primitives.md, "A link that looks like a button"). */}
      <Link
        to={ROUTES.HOME}
        className={cn(buttonVariants(), "mt-2 h-11 gap-1.5")}
      >
        Back to Chats
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
