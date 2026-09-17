import { Check } from "lucide-react";

import { cn } from "@monorepo/ui/utils/cn";

export interface LifecycleStep {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface LifecycleStepperProps {
  steps: LifecycleStep[];
  /**
   * `vertical` (default): the prototype's `ContractLifecycleStepper`, a
   * numbered list with a connector — a Hợp đồng's own lifecycle card.
   * `horizontal`: a wizard's own stepper (spec #153 §3.5, §10 row 15) — on
   * mobile it collapses to "Bước n/m · tên" instead of squeezing every step.
   */
  orientation?: "vertical" | "horizontal";
}

/** Which step is done or current is the caller's business either way. */
export function LifecycleStepper({
  steps,
  orientation = "vertical",
}: LifecycleStepperProps) {
  if (orientation === "horizontal") {
    return <HorizontalStepper steps={steps} />;
  }

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const next = steps[index + 1];
        return (
          <li
            key={step.id}
            className="flex gap-4"
            aria-current={step.isActive ? "step" : undefined}
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  step.isCompleted
                    ? "border-success/20 bg-success/10 text-white"
                    : step.isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted text-muted-foreground",
                )}
              >
                {step.isCompleted ? <Check className="size-5" /> : index + 1}
              </div>
              {next && (
                <div
                  className={cn(
                    "h-12 w-0.5",
                    next.isCompleted ? "bg-success/10" : "bg-border",
                  )}
                />
              )}
            </div>

            <div className="flex-1 pt-0.5 pb-8">
              <h4
                className={cn(
                  "font-semibold",
                  step.isCompleted || step.isActive
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.title}
              </h4>
              {step.description && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** The active step's index, or -1 when none is marked active. */
function activeStepIndex(steps: LifecycleStep[]): number {
  return steps.findIndex((step) => step.isActive);
}

function HorizontalStepper({ steps }: { steps: LifecycleStep[] }) {
  const index = activeStepIndex(steps);
  const current = index === -1 ? undefined : steps[index];

  return (
    <div>
      {current && (
        <p className="text-sm font-medium sm:hidden">
          Bước {index + 1}/{steps.length} · {current.title}
        </p>
      )}

      <ol className="hidden items-center sm:flex">
        {steps.map((step, stepIndex) => {
          const next = steps[stepIndex + 1];
          return (
            <li
              key={step.id}
              className="flex flex-1 items-center last:flex-none"
            >
              <div className="flex flex-col items-center gap-1.5">
                <div
                  aria-current={step.isActive ? "step" : undefined}
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                    step.isCompleted
                      ? "border-success/20 bg-success/10 text-white"
                      : step.isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {step.isCompleted ? (
                    <Check className="size-4" />
                  ) : (
                    stepIndex + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    step.isCompleted || step.isActive
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
              </div>
              {next && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1",
                    step.isCompleted ? "bg-success/20" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
