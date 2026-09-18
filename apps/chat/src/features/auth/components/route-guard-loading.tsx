import { Loader2 } from "lucide-react";

/** Shown by both guards while `useSessionCheck` awaits `/auth/refresh`. */
export default function RouteGuardLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span>Checking session...</span>
      </div>
    </div>
  );
}
