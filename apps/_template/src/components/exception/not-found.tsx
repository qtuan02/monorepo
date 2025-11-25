import { Button } from "@fe-monorepo/ui";
import { useTranslations } from "next-intl";

const NotFound = () => {
  const t = useTranslations("Exception");
  return <Button>{t("back")}</Button>;
};

export default NotFound;
