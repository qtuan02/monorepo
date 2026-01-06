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
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      label: "Hooks",
      value: hooks.length,
      icon: Code2,
      href: "/hooks",
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
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
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
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
                className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <stat.icon className="size-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
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
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Features
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
