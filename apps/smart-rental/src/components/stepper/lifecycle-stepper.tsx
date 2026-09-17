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
}

/**
 * A vertical list of numbered steps with a connector between them — the
 * prototype's `ContractLifecycleStepper`, which onboarding and the Hợp đồng
 * screens share. Which step is done or current is the caller's business.
 */
export function LifecycleStepper({ steps }: LifecycleStepperProps) {
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
                    ? "border-emerald-500 bg-emerald-500 text-white"
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
                    next.isCompleted ? "bg-emerald-500" : "bg-border",
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
