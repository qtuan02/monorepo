import type { Utility } from "~/types/utility";

/** "> 2× kỳ trước" (ADR-0012, spec #153 §10 row 27). */
export const UTILITY_ANOMALY_MULTIPLIER = 2;

/**
 * Whether a persisted Chỉ số reading is "bất thường" — never a stored state
 * (ADR-0012): a reading that went backwards, or whose consumption is more
 * than `UTILITY_ANOMALY_MULTIPLIER`× the previous period's for the same
 * Phòng + loại. `previous` absent (the reading's first period) can never be
 * anomalous by ratio.
 */
export function isUtilityAnomalous(
  current: Pick<Utility, "oldIndex" | "newIndex" | "consumption">,
  previous?: Pick<Utility, "consumption">,
): boolean {
  if (current.newIndex < current.oldIndex) return true;
  if (!previous || previous.consumption <= 0) return false;
  return (
    current.consumption > previous.consumption * UTILITY_ANOMALY_MULTIPLIER
  );
}

/**
 * Pairs every reading with the one before it for the same Phòng + loại (by
 * `month`, ascending) and flags the anomalous ones — the shape
 * `calculateUtilityStats` and Việc cần làm's Chỉ số source both need.
 */
export function findAnomalousUtilities(utilities: Utility[]): Utility[] {
  const byRoomType = new Map<string, Utility[]>();
  for (const utility of utilities) {
    const key = `${utility.roomId}-${utility.type}`;
    const list = byRoomType.get(key);
    if (list) list.push(utility);
    else byRoomType.set(key, [utility]);
  }

  const anomalous: Utility[] = [];
  for (const readings of byRoomType.values()) {
    const sorted = [...readings].sort((a, b) => a.month.localeCompare(b.month));
    sorted.forEach((utility, index) => {
      if (isUtilityAnomalous(utility, sorted[index - 1]))
        anomalous.push(utility);
    });
  }
  return anomalous;
}
