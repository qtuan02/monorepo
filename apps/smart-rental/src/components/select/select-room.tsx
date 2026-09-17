import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@monorepo/ui/components/combobox";

import { useGetRooms } from "~/hooks/api/room";

interface RoomOption {
  value: string;
  label: string;
}

interface SelectRoomProps {
  /** The Building scope a wizard already picked — narrows the option list. */
  buildingId?: string | null;
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
  value,
  onValueChange,
  disabled,
  placeholder = "Tìm phòng",
}: SelectRoomProps) {
  const { data: rooms = [], isFetching } = useGetRooms({ buildingId });
  const options: RoomOption[] = rooms.map((room) => ({
    value: room.id,
    label: `${room.name} · Tầng ${room.floor}`,
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
