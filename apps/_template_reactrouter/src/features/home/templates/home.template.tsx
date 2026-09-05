import { useTranslation } from "react-i18next";

import type { HomeModule } from "~/features/home/types/home-module";
import ModuleCard from "~/features/home/components/module-card";

type HomeTemplateProps = {
  /** The environment this bundle was built against, resolved by the route's loader. */
  appEnv: string;
  /** The catalogue, resolved by the route's loader — the page owns the read, the slice the UI. */
  modules: readonly HomeModule[];
};

/**
 * The home screen, rendered on the server before any JavaScript runs — in the
 * language `root.tsx`'s middleware negotiated for this request, because
 * `entry.server` wraps the tree in an i18next instance fixed to it. So the same
 * `useTranslation()` a client component would write produces translated markup
 * in the first response here.
 *
 * Two regions: the Template's own hero, and the module catalogue every card of
 * which is a link to a public `/modules/:slug` page. The catalogue is what a
 * crawler is here to read, which is why it arrives as a prop from the loader
 * rather than being fetched after paint.
 *
 * No `<main>` and no `min-h-dvh`: the `layout` slice owns both, and this renders
 * into `BodyTemplate`'s `<Outlet />`.
 */
export default function HomeTemplate({ appEnv, modules }: HomeTemplateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-12 py-12">
      <section className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            {t("templateReactRouter.home.eyebrow")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t("templateReactRouter.home.title")}
          </h1>
          {/* The lead carries no markup of its own. A catalogue message may not
              hold a rich-text tag — it is the one construct the i18next and
              next-intl Flavors cannot agree on, and
              `catalogue-invariants.test.ts` fails any message containing one — so
              the path it used to wrap in a <code> is plain prose instead. */}
          <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
            {t("templateReactRouter.home.lead")}
          </p>
        </header>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-border rounded-lg border p-4">
            <dt className="text-muted-foreground text-xs font-medium">
              {t("templateReactRouter.home.specs.render.label")}
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {t("templateReactRouter.home.specs.render.value")}
            </dd>
          </div>
          <div className="border-border rounded-lg border p-4">
            <dt className="text-muted-foreground text-xs font-medium">
              {t("templateReactRouter.home.specs.runner.label")}
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {t("templateReactRouter.home.specs.runner.value")}
            </dd>
          </div>
          <div className="border-border rounded-lg border p-4">
            <dt className="text-muted-foreground text-xs font-medium">
              {t("templateReactRouter.home.specs.routeTable.label")}
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {t("templateReactRouter.home.specs.routeTable.value")}
            </dd>
          </div>
          <div className="border-border rounded-lg border p-4">
            <dt className="text-muted-foreground text-xs font-medium">
              {t("templateReactRouter.home.specs.environment.label")}
            </dt>
            {/* The one value that is not a catalogue string: it comes from the
                loader, so a screen that ignored `loaderData` would show nothing
                here. */}
            <dd className="mt-1 text-sm font-medium">{appEnv}</dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="home-catalogue-heading"
        className="flex flex-col gap-6"
      >
        <header className="flex flex-col gap-1">
          <h2
            id="home-catalogue-heading"
            className="text-xl font-semibold tracking-tight"
          >
            {t("home.title")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("home.description")}
          </p>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              id={module.id}
              comingSoon={module.comingSoon}
              title={t(`home.modules.${module.id}.title`)}
              description={t(`home.modules.${module.id}.description`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
