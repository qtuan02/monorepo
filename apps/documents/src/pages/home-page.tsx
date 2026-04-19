import { useEffect } from "react";
import { Code2, Layers, Package, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router";

import { useComponentMetadata } from "~/hooks/use-component-metadata";
import { useHookMetadata } from "~/hooks/use-hook-metadata";

export default function HomePage() {
  const { components } = useComponentMetadata();
  const { hooks } = useHookMetadata();

  useEffect(() => {
    document.title = "Documents";
  }, []);

  const stats = [
    {
      label: "Components",
      value: components.length,
      icon: Layers,
      href: "/components",
    },
    {
      label: "Hooks",
      value: hooks.length,
      icon: Code2,
      href: "/hooks",
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "Beautiful UI Components",
      description:
        "Pre-built, accessible components based on shadcn/ui design system.",
    },
    {
      icon: Zap,
      title: "Custom React Hooks",
      description:
        "Reusable hooks for common patterns like debounce, localStorage, and more.",
    },
    {
      icon: Package,
      title: "Monorepo Ready",
      description:
        "All packages designed to work seamlessly in a monorepo architecture.",
    },
  ];

  return (
    <>
      <div className="px-4 py-8 md:px-12">
        <div className="mx-auto max-w-7xl space-y-12">
          <header className="space-y-4">
            <h1 className="text-foreground text-4xl font-bold tracking-tight">
              UI Documentation
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Explore the component library and hooks available in the monorepo.
              Browse components, view source code, and learn how to use each
              item.
            </p>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                to={stat.href}
                className="group border-border bg-card hover:border-primary rounded-xl border p-6 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="border-border rounded-lg border p-3">
                    <stat.icon className="text-foreground size-6" />
                  </div>
                  <div>
                    <div className="text-foreground text-3xl font-bold">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </section>

          <section className="space-y-6">
            <h2 className="text-foreground text-2xl font-semibold">Features</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="border-border bg-card rounded-xl border p-6"
                >
                  <div className="border-border text-foreground mb-4 inline-flex rounded-lg border p-3">
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="text-foreground mb-2 font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-foreground text-2xl font-semibold">
              Published Packages
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href="https://www.npmjs.com/package/@fe-monorepo/ui"
                target="_blank"
                rel="noopener noreferrer"
                className="group border-border bg-card hover:border-primary flex items-center gap-4 rounded-xl border p-5 transition-all hover:shadow-md"
              >
                <div className="border-border text-foreground flex size-12 items-center justify-center rounded-lg border">
                  <Package className="size-6" />
                </div>
                <div className="flex-1">
                  <div className="text-foreground font-semibold">
                    @fe-monorepo/ui
                  </div>
                  <div className="text-muted-foreground text-sm">
                    UI Component Library
                  </div>
                </div>
                <svg
                  className="text-muted-foreground size-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <a
                href="https://www.npmjs.com/package/@fe-monorepo/hook"
                target="_blank"
                rel="noopener noreferrer"
                className="group border-border bg-card hover:border-primary flex items-center gap-4 rounded-xl border p-5 transition-all hover:shadow-md"
              >
                <div className="border-border text-foreground flex size-12 items-center justify-center rounded-lg border">
                  <Code2 className="size-6" />
                </div>
                <div className="flex-1">
                  <div className="text-foreground font-semibold">
                    @fe-monorepo/hook
                  </div>
                  <div className="text-muted-foreground text-sm">
                    React Hooks Library
                  </div>
                </div>
                <svg
                  className="text-muted-foreground size-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
