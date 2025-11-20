"use client";

import { Button } from "@monorepo/ui/shadcn-ui/button";

const ButtonSentryError = () => {
  return (
    <Button
      onClick={() => {
        throw new Error("Sentry Test Error");
      }}
    >
      Sentry Error
    </Button>
  );
};

export { ButtonSentryError };
