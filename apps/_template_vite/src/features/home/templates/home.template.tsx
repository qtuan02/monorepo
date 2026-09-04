import {
  Activity,
  BarChart3,
  Calendar,
  Pill,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type { HomeModule } from "~/features/home/types/home-module";
import { ROUTES } from "~/constants/routes";
import { HomeModuleEnum } from "~/features/home/types/home-module";
import CardItem from "../components/card-item";

const modules: Pick<HomeModule, "id" | "icon" | "navigateTo">[] = [
  {
    id: HomeModuleEnum.DASHBOARD,
    icon: Activity,
    navigateTo: ROUTES.DASHBOARD,
  },
  {
    id: HomeModuleEnum.POS,
    icon: ShoppingCart,
    navigateTo: ROUTES.POS,
  },
  {
    id: HomeModuleEnum.PATIENTS,
    icon: Users,
    navigateTo: ROUTES.PATIENTS,
  },
  {
    id: HomeModuleEnum.MEDICATIONS,
    icon: Pill,
    navigateTo: ROUTES.MEDICATIONS,
  },
  {
    id: HomeModuleEnum.ANALYTICS,
    icon: BarChart3,
    navigateTo: ROUTES.ANALYTICS,
  },
  {
    id: HomeModuleEnum.APPOINTMENTS,
    icon: Calendar,
    navigateTo: ROUTES.APPOINTMENTS,
  },
];

export default function HomeTemplate() {
  const { t } = useTranslation();

  return (
    <div className="py-8">
      <header className="mb-6">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          {t("home.title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("home.description")}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <CardItem
            key={module.id}
            icon={module.icon}
            navigateTo={module.navigateTo}
            title={t(`home.modules.${module.id}.title`)}
            description={t(`home.modules.${module.id}.description`)}
          />
        ))}
      </div>
    </div>
  );
}
