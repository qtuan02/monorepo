import { useTranslation } from "react-i18next";

import { Button } from "@monorepo/ui/components/button";

/**
 * What the `react-error-boundary` in `~/pages/main.tsx` renders once the tree has
 * thrown. A full reload rather than a retry button: at this point the app's state
 * is of unknown validity, so re-rendering the same tree tends to throw straight
 * back.
 */
export default function InternalServerError() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-foreground text-3xl font-bold">
        {t("internalServerError.title")}
      </h1>
      <p className="text-muted-foreground max-w-lg text-center">
        {t("internalServerError.message")}
      </p>
      <Button className="mt-2" onClick={() => window.location.reload()}>
        {t("internalServerError.reload")}
      </Button>
    </div>
  );
}
