import type { LifecycleStep } from "~/components/stepper/lifecycle-stepper";
import type { ContractStatus } from "~/types/contract";
import { contractStatusConfig } from "~/constants/status";

/** The one order a Hợp đồng moves through; a status is its position here. */
const LIFECYCLE: ContractStatus[] = ["pending", "active", "ending", "ended"];

/** The lifecycle as stepper steps: everything before the status done, the status active. */
export function getContractLifecycleSteps(
  status: ContractStatus,
): LifecycleStep[] {
  const current = LIFECYCLE.indexOf(status);

  return LIFECYCLE.map((step, index) => ({
    id: step,
    title: contractStatusConfig[step].label,
    isCompleted: index < current,
    isActive: index === current,
  }));
}
