import type { LucideProps } from "lucide-react";
import type * as React from "react";

/**
 * A lucide icon as a component. Spelled `ComponentType` rather than lucide's own
 * `ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<…>>`:
 * React 19 passes `ref` as a plain prop, so the forwardRef spelling names an
 * implementation detail this app no longer has.
 */
export type IconComponent = React.ComponentType<LucideProps>;

export enum HomeModuleEnum {
  DASHBOARD = "dashboard",
  POS = "pos",
  PATIENTS = "patients",
  MEDICATIONS = "medications",
  ANALYTICS = "analytics",
  APPOINTMENTS = "appointments",
}

export interface HomeModule {
  id: HomeModuleEnum;
  title: string;
  description: string;
  icon: IconComponent;
  navigateTo: string;
}
