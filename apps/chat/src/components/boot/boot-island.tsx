import * as React from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { BrandMark } from "~/components/brand/brand-mark";
import { Island } from "~/components/island/island";

const SLOW_CONNECTION_DELAY_MS = 10_000;

interface BootIslandProps {
  message: string;
}

/**
 * The one boot screen both the Health gate and the session-check guards
 * render (CONTEXT.md, ADR-0016) — brand mark + spinner + one line that only
 * ever changes its text between phases, so nothing jumps between them.
 * `role="status"` carries the text change to assistive tech.
 *
 * The "still connecting" line is this component's own timer rather than a
 * value threaded in: the Health gate and the session guard are two separate
 * mounts of it, so each phase gets a fresh 10s grace period instead of
 * inheriting whatever the previous phase's clock had already used up.
 */
export function BootIsland({ message }: BootIslandProps) {
  const { t } = useTranslation();
  const [isSlow, setIsSlow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), SLOW_CONNECTION_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="grid min-h-dvh place-items-center p-2 md:p-3">
      <Island className="flex flex-col items-center gap-3 px-8 py-10 text-center">
        <BrandMark />
        <div
          role="status"
          className="text-muted-foreground flex items-center gap-2 text-sm"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          <span>{message}</span>
        </div>
        {isSlow && (
          <p className="text-muted-foreground text-xs">
            {t("chat.common.stillConnecting")}
          </p>
        )}
      </Island>
    </main>
  );
}
