import type { Control } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";

import { Button } from "@monorepo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@monorepo/ui/components/card";
import { Checkbox } from "@monorepo/ui/components/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@monorepo/ui/components/field";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@monorepo/ui/components/progress";
import { cn } from "@monorepo/ui/utils/cn";

import type {
  LiquidationFormInput,
  LiquidationFormValues,
} from "~/features/contracts/types/liquidation-form";
import { liquidationChecklist } from "~/features/contracts/types/liquidation-form";

interface LiquidationChecklistProps {
  control: Control<LiquidationFormInput, unknown, LiquidationFormValues>;
  onCancel: () => void;
  onNext: () => void;
}

const checklistIds = liquidationChecklist.map((item) => item.id);

/**
 * Step 1 of a Thanh lý: the four boxes, each a field of the liquidation form,
 * and the "Tiếp tục" that unlocks once all are ticked. The one subscriber to
 * those fields, so the flow around it never re-renders on a tick.
 */
export default function LiquidationChecklist({
  control,
  onCancel,
  onNext,
}: LiquidationChecklistProps) {
  const ticked = useWatch({ control, name: checklistIds });
  const completed = ticked.filter((value) => value === true).length;
  const total = liquidationChecklist.length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Danh sách kiểm tra tài sản
          </CardTitle>
          <CardDescription>
            {completed}/{total} hoàn thành
          </CardDescription>
          <Progress value={(completed / total) * 100} className="mt-4">
            <ProgressTrack>
              <ProgressIndicator className="bg-emerald-500" />
            </ProgressTrack>
          </Progress>
        </CardHeader>
        <CardContent className="space-y-3">
          {liquidationChecklist.map((item) => (
            <Controller
              key={item.id}
              name={item.id}
              control={control}
              render={({ field }) => (
                <Field
                  orientation="horizontal"
                  className={cn(
                    "rounded-lg border p-3 transition-colors",
                    field.value ? "bg-emerald-50" : "hover:bg-muted/50",
                  )}
                >
                  <Checkbox
                    id={field.name}
                    name={field.name}
                    checked={field.value === true}
                    onCheckedChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                  <FieldContent>
                    <FieldLabel
                      htmlFor={field.name}
                      className={cn(
                        field.value && "text-muted-foreground line-through",
                      )}
                    >
                      {item.title}
                    </FieldLabel>
                    <FieldDescription>{item.description}</FieldDescription>
                  </FieldContent>
                </Field>
              )}
            />
          ))}
        </CardContent>
      </Card>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="button" disabled={completed < total} onClick={onNext}>
          Tiếp tục: Thanh toán phí
        </Button>
      </div>
    </>
  );
}
