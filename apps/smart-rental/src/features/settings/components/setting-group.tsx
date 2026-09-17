import { ChevronDown } from "lucide-react";

import { Badge } from "@monorepo/ui/components/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@monorepo/ui/components/collapsible";
import { cn } from "@monorepo/ui/utils/cn";

import type { Setting, SettingCategory } from "~/types/setting";
import { statusTone } from "~/constants/status";
import { settingCategoryConfig } from "~/features/settings/constants/setting-categories";
import { formatCurrency } from "~/utils/currency";

interface SettingGroupProps {
  category: SettingCategory;
  settings: Setting[];
}

function SettingValue({ setting }: { setting: Setting }) {
  const { value, type } = setting;

  if (type === "toggle") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "font-medium",
          value ? statusTone.success : statusTone.neutral,
        )}
      >
        {value ? "Bật" : "Tắt"}
      </Badge>
    );
  }
  // The prototype's heuristic: a number above 100 is money.
  if (type === "number" && typeof value === "number" && value > 100) {
    return formatCurrency(value);
  }
  return String(value);
}

/** One collapsible group of Cài đặt, open by default, read-only as in the prototype. */
export default function SettingGroup({
  category,
  settings,
}: SettingGroupProps) {
  const config = settingCategoryConfig[category];
  const Icon = config.icon;

  return (
    <Collapsible
      defaultOpen
      className="bg-card space-y-3 rounded-lg border p-4"
    >
      <CollapsibleTrigger className="group/settings hover:text-foreground/80 flex w-full items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
            <Icon className="text-primary size-4" />
          </div>
          <div className="text-left">
            <h2 className="text-foreground font-semibold">{config.label}</h2>
            <p className="text-muted-foreground text-xs">
              {config.description}
            </p>
          </div>
        </div>
        <ChevronDown className="text-muted-foreground size-4 transition-transform group-data-panel-open/settings:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-2">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="bg-muted/30 flex items-center justify-between rounded-lg px-4 py-3"
          >
            <div className="flex-1">
              <h3 className="text-foreground text-sm font-medium">
                {setting.label}
              </h3>
              {setting.description && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {setting.description}
                </p>
              )}
              <p className="text-muted-foreground/70 mt-1.5 text-xs">
                Cập nhật: {setting.updated}
              </p>
            </div>
            <p className="ml-4 max-w-xs truncate text-right text-sm font-medium">
              <SettingValue setting={setting} />
            </p>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
