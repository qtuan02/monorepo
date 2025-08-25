import { ComponentType } from "react";

export interface IDocComponentProps {
  locale: string;
  slug?: string[];
}

export type DocItem = {
  key: string;
  label: string;
  href: string;
  component: ComponentType<IDocComponentProps>;
};
