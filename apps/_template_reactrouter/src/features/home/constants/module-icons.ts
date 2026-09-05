import {
  Activity,
  BarChart3,
  Calendar,
  Pill,
  ShoppingCart,
  Users,
} from "lucide-react";

import type {
  HomeModuleId,
  IconComponent,
} from "~/features/home/types/home-module";

/**
 * Icons live here, not in the catalogue: loader data is serialized into the
 * hydration payload and a component reference is not serializable. The id is
 * the join.
 *
 * Its own file rather than a constant inside `home.template.tsx` (where the
 * Next Template keeps it) because two templates render the join here — the
 * launcher's cards and the module page's header — and one map is what keeps a
 * module from wearing two different icons.
 */
export const moduleIcons: Record<HomeModuleId, IconComponent> = {
  dashboard: Activity,
  pos: ShoppingCart,
  patients: Users,
  medications: Pill,
  analytics: BarChart3,
  appointments: Calendar,
};
