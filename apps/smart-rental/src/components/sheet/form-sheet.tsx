import type { FormEventHandler, ReactNode } from "react";
import { useState } from "react";

import { Button } from "@monorepo/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@monorepo/ui/components/sheet";

import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Shared with the submit `Button`'s `form` attribute. */
  formId: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  /** `form.formState.isDirty` — closing while dirty asks for confirmation first. */
  isDirty: boolean;
  isPending?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  children: ReactNode;
}

/**
 * The one shape a short create/edit form takes (spec #153 §3.5, §10 row 15):
 * a `Sheet` on the right, fields in the body, submit in the footer — and
 * closing (Escape, backdrop, the header's own `X`, or Hủy) while the form is
 * dirty is intercepted by an `AlertDialog` instead of discarding silently.
 */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  formId,
  onSubmit,
  isDirty,
  isPending,
  submitLabel = "Lưu lại",
  cancelLabel = "Hủy",
  children,
}: FormSheetProps) {
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next && isDirty) {
      setIsConfirmCloseOpen(true);
      return;
    }
    onOpenChange(next);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b">
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <form
            id={formId}
            onSubmit={onSubmit}
            noValidate
            className="flex-1 overflow-y-auto p-4"
          >
            {children}
          </form>
          <SheetFooter className="flex-row justify-end border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" form={formId} disabled={isPending}>
              {isPending ? "Đang lưu…" : submitLabel}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmActionDialog
        open={isConfirmCloseOpen}
        onOpenChange={setIsConfirmCloseOpen}
        title="Hủy thay đổi?"
        description="Các thay đổi chưa lưu sẽ mất nếu đóng biểu mẫu này."
        actionLabel="Đóng biểu mẫu"
        cancelLabel="Tiếp tục sửa"
        variant="destructive"
        onConfirm={() => {
          setIsConfirmCloseOpen(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
