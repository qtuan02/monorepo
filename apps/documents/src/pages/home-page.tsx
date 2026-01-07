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
          {/* Hero Section */}
          <header className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
              UI Documentation
            </h1>
            <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              Explore the component library and hooks available in the monorepo.
              Browse components, view source code, and learn how to use each
              item.
            </p>
          </header>

          {/* Stats Grid */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                to={stat.href}
                className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-black hover:shadow-md dark:border-gray-800 dark:bg-black dark:hover:border-white"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                    <stat.icon className="size-6 text-black dark:text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-black dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </section>

          {/* Features Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Features
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-black"
                >
                  <div className="mb-4 inline-flex rounded-lg border border-gray-100 p-3 text-black dark:border-gray-800 dark:text-white">
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="mb-2 font-semibold text-black dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* NPM Packages Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Published Packages
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href="https://www.npmjs.com/package/@fe-monorepo/ui"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-black hover:shadow-md dark:border-gray-800 dark:bg-black dark:hover:border-white"
              >
                <div className="flex size-12 items-center justify-center rounded-lg border border-gray-100 text-black dark:border-gray-800 dark:text-white">
                  <Package className="size-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-black dark:text-white">
                    @fe-monorepo/ui
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    UI Component Library
                  </div>
                </div>
                <svg
                  className="size-5 text-gray-400 transition-transform group-hover:translate-x-1 dark:text-gray-600"
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
                className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-black hover:shadow-md dark:border-gray-800 dark:bg-black dark:hover:border-white"
              >
                <div className="flex size-12 items-center justify-center rounded-lg border border-gray-100 text-black dark:border-gray-800 dark:text-white">
                  <Code2 className="size-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-black dark:text-white">
                    @fe-monorepo/hook
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    React Hooks Library
                  </div>
                </div>
                <svg
                  className="size-5 text-gray-400 transition-transform group-hover:translate-x-1 dark:text-gray-600"
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
