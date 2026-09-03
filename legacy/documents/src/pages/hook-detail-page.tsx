import { useEffect } from "react";
import { Link, useParams } from "react-router";

import Breadcrumb from "~/components/breadcrumb";
import HookDetail from "~/components/hook-detail";
import { useHookById } from "~/hooks/use-hook-metadata";

export default function HookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hook } = useHookById(id || "");

  useEffect(() => {
    if (hook) {
      document.title = `Hook | ${hook.name}`;
    }
  }, [hook]);

  if (!hook) {
    return (
      <>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-foreground mb-2 text-2xl font-bold">
              Hook Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              The hook &quot;{id}&quot; could not be found.
            </p>
            <Link to="/hooks" className="text-primary hover:underline">
              ← Back to Hooks
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="px-4 py-4 md:px-12 md:py-6">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Hooks", path: "/hooks" },
              { label: hook.name },
            ]}
            className="mb-6"
          />
          <HookDetail hook={hook} />
        </div>
      </div>
    </>
  );
}
