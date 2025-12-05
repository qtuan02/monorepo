"use client";

import { useTranslations } from "next-intl";

import { Button } from "@monorepo/ui/components/button";

function Error() {
  const t = useTranslations("Exception");

  return <Button>{t("back")}</Button>;
}

export default Error;
