"use client";

import { Button } from "@fe-monorepo/ui/components/button";

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
