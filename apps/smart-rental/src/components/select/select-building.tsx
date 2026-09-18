import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@monorepo/ui/components/combobox";

import { useGetBuildings } from "~/hooks/api/building";

interface BuildingOption {
  value: string;
  label: string;
}

interface SelectBuildingProps {
  /** Wired to a `FieldLabel htmlFor` by the caller — forwarded to the input. */
  id?: string;
  value?: string;
  onValueChange: (buildingId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * A self-fetching Toà nhà picker (patterns-self-fetching-inputs.md), the
 * counterpart of `select-room.tsx` / `select-tenant.tsx` — its first live
 * call site is the Phòng `FormSheet` (spec #153 §10 row 15).
 */
export function SelectBuilding({
  id,
  value,
  onValueChange,
  disabled,
  placeholder = "Tìm toà nhà",
}: SelectBuildingProps) {
  const { data: buildings = [], isFetching } = useGetBuildings();
  const options: BuildingOption[] = buildings.map((building) => ({
    value: building.id,
    label: building.name,
  }));

  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <Combobox<BuildingOption>
      items={options}
      value={selected}
      onValueChange={(option) => onValueChange(option?.value ?? null)}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.value}
      disabled={disabled || isFetching}
    >
      <ComboboxInput
        id={id}
        placeholder={isFetching ? "Đang tải…" : placeholder}
      />
      <ComboboxContent>
        <ComboboxEmpty>Không tìm thấy toà nhà.</ComboboxEmpty>
        <ComboboxList>
          {(option) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
