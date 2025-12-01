import { useTranslations } from "next-intl";

import { SidebarTrigger } from "~/features/layout/components/sidebar";

export default function HeaderTemplate() {
  const t = useTranslations("Dashboard");

  return (
    <header className="fixed flex h-16 w-full items-center gap-2 border-b bg-white px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center gap-2">
        <h1 className="text-lg font-semibold">{t("title")}</h1>
      </div>
    </header>
  );
}
