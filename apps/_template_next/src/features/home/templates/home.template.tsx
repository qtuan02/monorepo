import {
  Activity,
  BarChart3,
  Calendar,
  Pill,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

import type {
  HomeModule,
  HomeModuleId,
  IconComponent,
} from "~/features/home/types/home-module";
import { PageContent } from "~/components/page/page-content";
import { PageHeader } from "~/components/page/page-header";
import ModuleCard from "~/features/home/components/module-card";

/**
 * Icons live here, not in the catalogue: `"use cache"` serializes its result and
 * a component reference is not serializable. The id is the join.
 */
const moduleIcons: Record<HomeModuleId, IconComponent> = {
  dashboard: Activity,
  pos: ShoppingCart,
  patients: Users,
  medications: Pill,
  analytics: BarChart3,
  appointments: Calendar,
};

interface HomeTemplateProps {
  /** Resolved by the route module — the page owns the fetch, the slice the UI. */
  modules: HomeModule[];
}

/**
 * The public launcher. Everything here renders on the server and ships no
 * JavaScript, which is the point: this is the page a crawler reads.
 */
export default function HomeTemplate({ modules }: HomeTemplateProps) {
  const t = useTranslations();

  return (
    <>
      <PageHeader title={t("home.title")} description={t("home.description")} />
      <PageContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              icon={moduleIcons[module.id]}
              href={module.href}
              comingSoon={module.comingSoon}
              title={t(`home.modules.${module.id}.title`)}
              description={t(`home.modules.${module.id}.description`)}
            />
          ))}
        </div>
      </PageContent>
    </>
  );
}
