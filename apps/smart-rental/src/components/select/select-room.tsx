import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@monorepo/ui/components/combobox";

import { useGetBuildings } from "~/hooks/api/building";
import { useGetRooms } from "~/hooks/api/room";

interface RoomOption {
  value: string;
  label: string;
}

interface SelectRoomProps {
  /** The Building scope a wizard already picked — narrows the option list. */
  buildingId?: string | null;
  /** Only `available` Phòng — the Hợp đồng wizard's own step 1 (spec #153). */
  onlyAvailable?: boolean;
  value?: string;
  onValueChange: (roomId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * A self-fetching Phòng picker (patterns-self-fetching-inputs.md): owns its
 * own `useGetRooms` query and exposes only `value`/`onValueChange`, so a
 * caller never prop-drills the room list or a loading flag.
 */
export function SelectRoom({
  buildingId,
  onlyAvailable,
  value,
  onValueChange,
  disabled,
  placeholder = "Tìm phòng",
}: SelectRoomProps) {
  const { data: rooms = [], isFetching } = useGetRooms({ buildingId });
  // Scope null ("Tất cả Toà nhà") — the options span every Toà nhà, so each
  // one must name which (spec #179): "Phòng 101" alone would be ambiguous.
  const { data: buildings = [] } = useGetBuildings({ enabled: !buildingId });
  const buildingNameById = new Map(
    buildings.map((building) => [building.id, building.name]),
  );

  const options: RoomOption[] = rooms
    .filter((room) => !onlyAvailable || room.status === "available")
    .map((room) => ({
      value: room.id,
      label: buildingId
        ? `${room.name} · Tầng ${room.floor}`
        : `${room.name} · ${buildingNameById.get(room.buildingId) ?? "?"} · Tầng ${room.floor}`,
    }));

  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <Combobox<RoomOption>
      items={options}
      value={selected}
      onValueChange={(option) => onValueChange(option?.value ?? null)}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.value}
      disabled={disabled || isFetching}
    >
      <ComboboxInput placeholder={isFetching ? "Đang tải…" : placeholder} />
      <ComboboxContent>
        <ComboboxEmpty>Không tìm thấy phòng.</ComboboxEmpty>
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
