import type { ComponentType } from "react";

export interface IDocComponentProps {
  locale: string;
  slug?: string[];
}

export interface DocItem {
  key: string;
  label: string;
  href: string;
  component: ComponentType<IDocComponentProps>;
}
