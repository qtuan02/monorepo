import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@monorepo/ui/components/combobox";

import { useGetTenants } from "~/hooks/api/tenant";

interface TenantOption {
  value: string;
  label: string;
}

interface SelectTenantProps {
  buildingId?: string | null;
  value?: string;
  onValueChange: (tenantId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * A self-fetching Người thuê picker — the `SelectRoom` shape, over
 * `useGetTenants` (patterns-self-fetching-inputs.md).
 */
export function SelectTenant({
  buildingId,
  value,
  onValueChange,
  disabled,
  placeholder = "Tìm người thuê",
}: SelectTenantProps) {
  const { data: tenants = [], isFetching } = useGetTenants({ buildingId });
  const options: TenantOption[] = tenants.map((tenant) => ({
    value: tenant.id,
    label: `${tenant.name} · ${tenant.phone}`,
  }));

  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <Combobox<TenantOption>
      items={options}
      value={selected}
      onValueChange={(option) => onValueChange(option?.value ?? null)}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.value}
      disabled={disabled || isFetching}
    >
      <ComboboxInput placeholder={isFetching ? "Đang tải…" : placeholder} />
      <ComboboxContent>
        <ComboboxEmpty>Không tìm thấy người thuê.</ComboboxEmpty>
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
