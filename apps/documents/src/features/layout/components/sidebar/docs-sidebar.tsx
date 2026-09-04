import { BookOpen, Boxes, Puzzle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@monorepo/ui/components/sidebar";

import type { DocsEntry } from "~/types/docs-catalogue";
import { componentCatalogue, hookCatalogue } from "~/constants/docs-catalogue";
import { ROUTES } from "~/constants/routes";

interface CatalogueGroupProps {
  label: string;
  items: readonly DocsEntry[];
  /** `ROUTES.componentBySlugPath` or its hook twin — never an interpolated path. */
  buildPath: (slug: string) => string;
  pathname: string;
}

/**
 * One scrollable group of slugs. Declared at module scope, not inside
 * `DocsSidebar`: a component defined in another component's body is a new
 * reference every render, so React would remount the whole list each time
 * (see react-no-inline-components).
 */
function CatalogueGroup({
  label,
  items,
  buildPath,
  pathname,
}: CatalogueGroupProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((entry) => {
            const path = buildPath(entry.slug);

            return (
              <SidebarMenuItem key={entry.slug}>
                <SidebarMenuButton
                  size="sm"
                  isActive={pathname === path}
                  render={
                    <Link to={path} className="font-mono">
                      {entry.slug}
                    </Link>
                  }
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/**
 * The site's table of contents: the three top-level pages, then every primitive
 * and every hook by slug. The lists are built from the generated catalogues, so
 * a primitive added with `ui-add` appears here on the next build with no edit.
 */
export default function DocsSidebar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const sections = [
    {
      path: ROUTES.HOME,
      label: t("documents.nav.gettingStarted"),
      icon: BookOpen,
    },
    {
      path: ROUTES.COMPONENTS,
      label: t("documents.nav.components"),
      icon: Boxes,
    },
    { path: ROUTES.HOOKS, label: t("documents.nav.hooks"), icon: Puzzle },
  ];

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("documents.nav.sections")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((section) => (
                <SidebarMenuItem key={section.path}>
                  <SidebarMenuButton
                    isActive={pathname === section.path}
                    render={
                      <Link to={section.path}>
                        <section.icon className="size-4" />
                        <span>{section.label}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <CatalogueGroup
          label={t("documents.nav.components")}
          items={componentCatalogue.items}
          buildPath={ROUTES.componentBySlugPath}
          pathname={pathname}
        />

        <CatalogueGroup
          label={t("documents.nav.hooks")}
          items={hookCatalogue.items}
          buildPath={ROUTES.hookBySlugPath}
          pathname={pathname}
        />
      </SidebarContent>
    </Sidebar>
  );
}
