import { Button } from "@repo/ui/components/button";
import { useTranslations } from "next-intl";

const Error = () => {
  const t = useTranslations("Exception");
  return <Button>{t("back")}</Button>;
};

export default Error;
