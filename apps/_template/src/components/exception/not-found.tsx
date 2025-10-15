import { useTranslations } from "next-intl";

import { Button } from "@monorepo/ui/shadcn-ui/button";

const NotFound = () => {
  const t = useTranslations("Exception");
  return <Button>{t("back")}</Button>;
};

export default NotFound;
