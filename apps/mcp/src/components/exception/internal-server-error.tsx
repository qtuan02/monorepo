"use client";

import { useTranslations } from "next-intl";

import { Button } from "@monorepo/ui/components/button";

import { ExceptionState } from "~/components/exception/exception-state";

interface InternalServerErrorProps {
  /** React's own retry, handed down by `app/[locale]/error.tsx`. */
  reset: () => void;
}

/**
 * What the route segment's error boundary renders once the tree has thrown. It
 * has to be a Client Component — Next only accepts a client module as an
 * `error.tsx` — which is also why the translation comes from the provider in the
 * layout rather than from the request config.
 */
export default function InternalServerError({
  reset,
}: InternalServerErrorProps) {
  const t = useTranslations();

  return (
    <ExceptionState
      fullscreen
      title={t("internalServerError.title")}
      message={t("internalServerError.message")}
      action={
        <Button className="mt-2" onClick={reset}>
          {t("internalServerError.reload")}
        </Button>
      }
    />
  );
}
