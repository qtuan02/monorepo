import { Calendar, X } from "lucide-react";

import { Button } from "@monorepo/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";

import type { ReportFilters } from "~/features/reports/utils/report-filters";
import { occupancyBucketConfig, toFilterOptions } from "~/constants/status";
import {
  ALL,
  defaultReportFilters,
} from "~/features/reports/utils/report-filters";

interface ReportFiltersBarProps {
  /** The distinct Toà nhà / floor names in the rows, in first-seen order. */
  buildings: string[];
  floors: string[];
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
}

interface FilterSelectProps {
  value: string;
  allLabel: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterSelect({
  value,
  allLabel,
  options,
  onChange,
}: FilterSelectProps) {
  const label =
    value === ALL ? allLabel : options.find((o) => o.value === value)?.label;

  return (
    <Select value={value} onValueChange={(next) => onChange(next ?? ALL)}>
      <SelectTrigger size="sm" aria-label={allLabel} className="w-full sm:w-40">
        <SelectValue>{label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Three Selects and the "Chọn ngày" button, which has no picker yet — as in the prototype. */
export default function ReportFiltersBar({
  buildings,
  floors,
  filters,
  onChange,
}: ReportFiltersBarProps) {
  const isFiltering =
    filters.building !== ALL || filters.floor !== ALL || filters.status !== ALL;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <FilterSelect
        value={filters.building}
        allLabel="Tất cả tòa"
        options={buildings.map((name) => ({ value: name, label: name }))}
        onChange={(building) => onChange({ ...filters, building })}
      />
      <FilterSelect
        value={filters.floor}
        allLabel="Tất cả tầng"
        options={floors.map((name) => ({ value: name, label: name }))}
        onChange={(floor) => onChange({ ...filters, floor })}
      />
      <FilterSelect
        value={filters.status}
        allLabel="Tất cả trạng thái"
        options={toFilterOptions(occupancyBucketConfig)}
        // Every option is a config key or ALL, so the cast only restates that.
        onChange={(status) =>
          onChange({ ...filters, status: status as ReportFilters["status"] })
        }
      />
      <Button type="button" variant="outline" size="sm">
        <Calendar />
        Chọn ngày
      </Button>
      {isFiltering && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(defaultReportFilters)}
        >
          Xóa bộ lọc
          <X />
        </Button>
      )}
    </div>
  );
}
