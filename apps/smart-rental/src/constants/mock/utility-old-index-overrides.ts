import type { UtilityOldIndexOverride } from "~/types/utility";
import { trackMockReset } from "~/utils/mock-reset";

/** "Sửa chỉ số cũ" corrections (ticket #183, ADR-0013) — empty in the shipped Mock. */
export const mockUtilityOldIndexOverrides: UtilityOldIndexOverride[] = [];

export const resetMockUtilityOldIndexOverrides = trackMockReset(
  mockUtilityOldIndexOverrides,
);
