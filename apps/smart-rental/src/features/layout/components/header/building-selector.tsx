import { Building2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";

import { useGetBuildings } from "~/hooks/api/building";
import { useBuildingStore } from "~/stores/use-building-store";

// The Select needs a string per item, and Building scope's "mọi Toà nhà" is
// `null` — this sentinel is the one place the two meet.
const ALL_BUILDINGS = "all";

/**
 * The Building scope selector: owns its Toà nhà query (a self-fetching input)
 * and writes the choice to the app-wide store, which `persist` keeps across a
 * reload.
 */
export default function BuildingSelector() {
  const { data: buildings = [] } = useGetBuildings();
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const setSelectedBuildingId = useBuildingStore(
    (s) => s.setSelectedBuildingId,
  );

  const options = [
    { id: ALL_BUILDINGS, name: "Tất cả tòa nhà" },
    ...buildings.map(({ id, name }) => ({ id, name })),
  ];
  const value = selectedBuildingId ?? ALL_BUILDINGS;
  const selected = options.find((option) => option.id === value);

  return (
    <Select
      value={value}
      onValueChange={(next) =>
        setSelectedBuildingId(next === ALL_BUILDINGS ? null : next)
      }
    >
      <SelectTrigger
        aria-label="Tòa nhà"
        className="hover:bg-accent h-9 gap-2 border-none bg-transparent px-2 shadow-none"
      >
        <Building2 className="text-muted-foreground size-4 shrink-0" />
        <SelectValue>{selected?.name}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
