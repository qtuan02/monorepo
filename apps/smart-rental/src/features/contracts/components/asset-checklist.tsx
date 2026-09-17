import { useId, useState } from "react";
import { Key, Package } from "lucide-react";

import { Badge } from "@monorepo/ui/components/badge";
import { Button } from "@monorepo/ui/components/button";
import { Checkbox } from "@monorepo/ui/components/checkbox";
import { cn } from "@monorepo/ui/utils/cn";

import { InfoCard } from "~/components/card/info-card";

interface AssetItem {
  id: string;
  name: string;
  quantity: string;
  condition: string;
  category: "furniture" | "appliance" | "other";
}

/** The handover list the prototype hard-codes; ticks are local to the screen. */
const assets: AssetItem[] = [
  {
    id: "keys",
    name: "Chìa khóa phòng",
    quantity: "2 chiếc",
    condition: "Mới",
    category: "other",
  },
  {
    id: "ac",
    name: "Điều hòa Panasonic",
    quantity: "1 cái",
    condition: "Hoạt động tốt",
    category: "appliance",
  },
  {
    id: "bed",
    name: "Giường gỗ 1m6",
    quantity: "1 bộ",
    condition: "Mới 90%",
    category: "furniture",
  },
  {
    id: "wardrobe",
    name: "Tủ quần áo 2 cánh",
    quantity: "1 cái",
    condition: "Mới",
    category: "furniture",
  },
];

const categoryIcon = { furniture: Package, appliance: Key, other: null };

/** "Danh mục tài sản bàn giao" on the Hợp đồng detail; the two buttons have no flow yet. */
export default function AssetChecklist() {
  const idPrefix = useId();
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(assets.map((asset) => asset.id)),
  );

  const toggle = (id: string) =>
    setChecked((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <InfoCard title="Danh mục tài sản bàn giao">
      <ul className="space-y-2">
        {assets.map((asset) => {
          const Icon = categoryIcon[asset.category];
          const isChecked = checked.has(asset.id);

          return (
            <li
              key={asset.id}
              className={cn(
                "flex items-center justify-between rounded-lg border p-3 transition-colors",
                isChecked ? "bg-muted/30" : "bg-background",
              )}
            >
              <label
                htmlFor={`${idPrefix}-${asset.id}`}
                className="flex cursor-pointer items-center gap-3"
              >
                <Checkbox
                  id={`${idPrefix}-${asset.id}`}
                  checked={isChecked}
                  onCheckedChange={() => toggle(asset.id)}
                />
                <span>
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium">{asset.name}</span>
                    <Badge
                      variant="secondary"
                      className="h-5 px-1.5 text-[10px]"
                    >
                      {asset.quantity}
                    </Badge>
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {asset.condition}
                  </span>
                </span>
              </label>
              {Icon && <Icon className="text-muted-foreground size-3.5" />}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" className="w-full">
          Thêm tài sản mới
        </Button>
        <Button type="button" size="sm" className="w-full">
          Ký biên bản bàn giao
        </Button>
      </div>
    </InfoCard>
  );
}
