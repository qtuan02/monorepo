import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Fragment } from "react";
import { Link } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@monorepo/ui/components/breadcrumb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@monorepo/ui/components/tabs";

import { InfoCard } from "~/components/card/info-card";
import { PageBackButton } from "~/components/navigation/page-back-button";
import { EmptyPanel } from "~/components/panel/empty-panel";
import { DetailSkeleton } from "~/components/panel/loading-panel";
import { useUrlTab } from "~/hooks/use-url-tab";

export interface DetailPageBreadcrumbItem {
  label: string;
  /** Omit on the last (current) item — it renders as the non-link page label. */
  to?: string;
}

export interface DetailPageTab {
  value: string;
  label: string;
  content: ReactNode;
}

export interface DetailPageNotFound {
  icon?: LucideIcon;
  title: string;
  description: string;
}

interface DetailPageShellProps<TEntity = unknown> {
  /**
   * The screen's name. The prototype's detail screens carry no visible heading
   * (the entity's own name is the title), so this one is for screen readers and
   * for the route-tree seam test, which asserts an `<h1>` per route.
   */
  title: string;
  /** Where "Quay lại" goes when `breadcrumb` is absent; defaults to one step back in history. */
  backTo?: string;
  /** Route ≥ 3 levels deep replaces "Quay lại" with a breadcrumb trail (spec #153 §3.4). */
  breadcrumb?: DetailPageBreadcrumbItem[];
  /**
   * The entity's own name, next to `badge`. Passing it switches on the header-entity
   * layout (name + badge + meta + actions, tabs below) — leave it out to keep the
   * plain back-button + actions + children layout the nine screens not yet migrated
   * to this anatomy still use.
   */
  name?: ReactNode;
  badge?: ReactNode;
  /** At most three short facts — anything shown here must not repeat inside a tab. */
  meta?: ReactNode[];
  actions?: ReactNode;
  /**
   * A small horizontal stepper under the name/meta row — a Hợp đồng's own
   * lifecycle (spec #179 §3.5, §10 row 16), rather than a 520px sidebar card.
   */
  headerStepper?: ReactNode;
  /** Real `Tabs` with panels — the relation a detail screen shows (Hoá đơn của Hợp đồng, …). */
  tabs?: DetailPageTab[];
  /**
   * A single "Hành động" card, rendered only once at least two items are
   * given (spec #179 §3.5) — a lone action belongs in `actions` (the header)
   * instead, so no screen ever shows a card with just one button.
   */
  actionsCard?: ReactNode[];
  /** The right column (`lg:` 1/3), visible across every tab — actions and links only. */
  sidebar?: ReactNode;
  /**
   * The query driving this screen. Once given, the shell owns the loading
   * skeleton and the "không tìm thấy" panel — no caller writes either branch
   * itself (spec #221 ticket T4). Every other prop above is still computed by
   * the caller from `query.data` directly, exactly as before.
   */
  query?: { data: TEntity | null | undefined; isLoading: boolean };
  /** The id `notFound` is called with once `query.data` resolves to nothing. */
  id?: string;
  notFound?: (id: string) => DetailPageNotFound;
  children?: ReactNode | ((entity: TEntity) => ReactNode);
}

export function DetailPageShell<TEntity = unknown>({
  title,
  backTo,
  breadcrumb,
  name,
  badge,
  meta,
  actions,
  headerStepper,
  tabs,
  actionsCard,
  sidebar,
  query,
  id,
  notFound,
  children,
}: DetailPageShellProps<TEntity>) {
  const hasBreadcrumb = !!breadcrumb && breadcrumb.length > 0;
  const hasTabs = !!tabs && tabs.length > 0;
  // Called unconditionally (Rules of Hooks) — the URL is only ever touched
  // once a screen actually has tabs to switch between.
  const [activeTab, setActiveTab] = useUrlTab(
    hasTabs ? tabs.map((tab) => tab.value) : [],
  );
  const hasActionsCard = !!actionsCard && actionsCard.length >= 2;
  const hasSidebar = hasActionsCard || !!sidebar;

  const topRow = (
    <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
      {hasBreadcrumb ? (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumb.map((item, index) => (
              <Fragment key={item.label}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.to ? (
                    <BreadcrumbLink render={<Link to={item.to} />}>
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      ) : (
        <PageBackButton to={backTo} />
      )}
      {!name && actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  );

  if (query?.isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="sr-only">{title}</h1>
        {topRow}
        <DetailSkeleton />
      </div>
    );
  }

  if (query && query.data == null) {
    const copy = notFound?.(id ?? "") ?? {
      title: "Không tìm thấy.",
      description: "",
    };
    return (
      <div className="space-y-6">
        <h1 className="sr-only">{title}</h1>
        {topRow}
        <EmptyPanel
          icon={copy.icon}
          title={copy.title}
          description={copy.description}
          className="border"
        />
      </div>
    );
  }

  const resolvedChildren =
    typeof children === "function"
      ? (children as (entity: TEntity) => ReactNode)(query?.data as TEntity)
      : children;

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{title}</h1>

      {topRow}

      {name && (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold">{name}</h2>
              {badge}
            </div>
            {meta && meta.length > 0 && (
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                {meta.slice(0, 3).map((item, index) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: meta is a fixed, never-reordered array with no id of its own.
                    key={`detail-meta-${index}`}
                    className="flex items-center gap-1.5"
                  >
                    {index > 0 && (
                      <span aria-hidden className="text-border">
                        ·
                      </span>
                    )}
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {headerStepper && <div className="print:hidden">{headerStepper}</div>}

      {hasTabs ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="print:hidden">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div
            className={hasSidebar ? "grid gap-6 pt-2 lg:grid-cols-3" : "pt-2"}
          >
            <div
              className={hasSidebar ? "space-y-6 lg:col-span-2" : "space-y-6"}
            >
              {tabs.map((tab) => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className="space-y-6"
                >
                  <TabPanelBody>{tab.content}</TabPanelBody>
                </TabsContent>
              ))}
            </div>
            {hasSidebar && (
              <div className="space-y-6 lg:col-span-1">
                {hasActionsCard && (
                  <InfoCard title="Hành động" className="print:hidden">
                    {actionsCard}
                  </InfoCard>
                )}
                {sidebar}
              </div>
            )}
          </div>
        </Tabs>
      ) : (
        resolvedChildren
      )}
    </div>
  );
}

/**
 * React Compiler otherwise memoizes a non-default tab's content onto a stale
 * snapshot once you've switched to it and a same-screen mutation updates the
 * underlying data (memory `smart-rental-react-compiler-tabs-stale-content`).
 * `"use no memo"` here is defense in depth for a new tabbed screen; it does
 * NOT replace the same directive on a producer component whose own JSX
 * expression is what the compiler mis-memoizes — `invoice-detail.template.tsx`
 * keeps its four directives: spiked by deleting them with this wrapper
 * already in place, the "Gửi nhắc" test (`invoice-detail.template.test.tsx`)
 * still fails on the Nhắc nợ tab staying stale. `detail-page-shell.test.tsx`'s
 * "tab không mặc định cập nhật sau mutation" only proves the shell-level
 * wrapper for content the CALLER doesn't itself memoize incorrectly.
 */
function TabPanelBody({ children }: { children: ReactNode }) {
  "use no memo";
  return <>{children}</>;
}
