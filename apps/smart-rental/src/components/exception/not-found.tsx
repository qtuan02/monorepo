import { Link } from "react-router";

import { buttonVariants } from "@monorepo/ui/components/button";
import { cn } from "@monorepo/ui/utils/cn";

import { ROUTES } from "~/constants/routes";

/**
 * The catch-all inside the shell. Its route sits outside `ProtectedRoute` on
 * purpose (see `~/pages/main.tsx`): a mistyped URL should say so, not bounce a
 * signed-in landlord to sign-in.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <h1 className="text-foreground text-3xl font-bold md:text-4xl">
        404 Không tìm thấy
      </h1>
      <p className="text-muted-foreground max-w-lg">
        Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.
      </p>
      {/* A <Link> styled with `buttonVariants`, not wrapped in `Button`: Base
          UI's Button assumes a native <button>. This navigates, so it stays a
          link (see architecture-ui-primitives.md). */}
      <Link to={ROUTES.HOME} className={cn(buttonVariants(), "mt-4")}>
        Về trang chủ
      </Link>
    </div>
  );
}
