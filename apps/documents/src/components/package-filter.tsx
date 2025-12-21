import { useSearchParams } from "react-router";
import { Tabs, TabsList, TabsTrigger } from "@monorepo/ui";

import type { PackageFilter } from "~/lib/package-filter-utils";
import {
  PACKAGE_FILTER_OPTIONS,
  getPackageFilterFromUrl,
} from "~/lib/package-filter-utils";

interface PackageFilterProps {
  className?: string;
}

export default function PackageFilter({ className }: PackageFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFilter = getPackageFilterFromUrl(searchParams);

  const handleFilterChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newParams.delete("package");
    } else {
      newParams.set("package", value);
    }
    setSearchParams(newParams, { replace: true });
  };

  return (
    <Tabs
      value={currentFilter}
      onValueChange={handleFilterChange}
      className={className}
      data-testid="package-filter"
    >
      <TabsList>
        {PACKAGE_FILTER_OPTIONS.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

