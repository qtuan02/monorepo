import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo/ui/components/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@monorepo/ui/components/toggle-group";

import type { Building } from "~/types/building";
import { useGetBuildings } from "~/hooks/api/building";
import { useBuildingStore } from "~/stores/use-building-store";

// The Select/ToggleGroup need a string per item, and Building scope's "mọi
// Toà nhà" is `null` — this sentinel is the one place the two meet.
const ALL_BUILDINGS = "all";

/** ≤ 6 Toà nhà is a tabs row; from 7, a `Select` (ADR-0011, spec #153 §10 row 21). */
export const BUILDING_SCOPE_TABS_MAX = 6;

interface BuildingScopeProps {
  buildings: Building[];
  value: string;
  onChange: (id: string | null) => void;
}

// A switch has no panel of its own — the "content" it drives is the whole
// routed page below, not a TabsContent — so this is a real `ToggleGroup`,
// not `Tabs`-as-buttons (see `list-view.tsx`'s own note on the same call).
function BuildingScopeTabs({ buildings, value, onChange }: BuildingScopeProps) {
  return (
    <div className="overflow-x-auto">
      <ToggleGroup
        value={[value]}
        onValueChange={(next) => {
          const selected = next[0];
          if (selected) onChange(selected === ALL_BUILDINGS ? null : selected);
        }}
        variant="outline"
        size="sm"
        spacing={0}
        className="w-max"
      >
        <ToggleGroupItem value={ALL_BUILDINGS}>Tất cả Toà nhà</ToggleGroupItem>
        {buildings.map((building) => (
          <ToggleGroupItem key={building.id} value={building.id}>
            {building.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

function BuildingScopeSelect({
  buildings,
  value,
  onChange,
}: BuildingScopeProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next === ALL_BUILDINGS ? null : next)}
    >
      <SelectTrigger aria-label="Toà nhà" className="w-64">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_BUILDINGS}>Tất cả Toà nhà</SelectItem>
        {buildings.map((building) => (
          <SelectItem key={building.id} value={building.id}>
            {building.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Building scope, as a row of the shell rather than a corner `Select`
 * (ADR-0011) — every screen sits under it, so nothing can "forget" the
 * scope the way seven pha-1 screens did. Owns its own Toà nhà query (a
 * self-fetching input) and writes the choice to the app-wide store, which
 * `persist` keeps across a reload.
 */
export default function BuildingScope() {
  const { data: buildings = [] } = useGetBuildings();
  const selectedBuildingId = useBuildingStore((s) => s.selectedBuildingId);
  const setSelectedBuildingId = useBuildingStore(
    (s) => s.setSelectedBuildingId,
  );

  if (buildings.length === 0) return null;

  const value = selectedBuildingId ?? ALL_BUILDINGS;
  const props: BuildingScopeProps = {
    buildings,
    value,
    onChange: setSelectedBuildingId,
  };

  return buildings.length > BUILDING_SCOPE_TABS_MAX ? (
    <BuildingScopeSelect {...props} />
  ) : (
    <BuildingScopeTabs {...props} />
  );
}
