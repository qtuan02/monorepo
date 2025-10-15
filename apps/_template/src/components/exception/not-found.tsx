import { Button } from "@monorepo/ui/shadcn-ui/button";
import { useTranslations } from "next-intl";

const NotFound = () => {
  const t = useTranslations("Exception");
  return <Button>{t("back")}</Button>;
};

export default NotFound;
