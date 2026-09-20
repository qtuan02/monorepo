import { useState } from "react";
import { useNavigate } from "react-router";

import { toast } from "@monorepo/ui/components/toast";

interface DeleteEntityMutation {
  mutate: (id: string, options?: { onSuccess?: () => void }) => void;
  isPending: boolean;
}

interface UseDeleteEntityOptions {
  /** A `useDelete<Entity>()` mutation result — or any object of this shape. */
  mutation: DeleteEntityMutation;
  id: string;
  /** e.g. `"phòng"`, `"toà nhà"` — the dialog title becomes `Xóa ${label}`. */
  label: string;
  /**
   * The record's own display text, quoted into the confirm description —
   * `phòng "Phòng 101"`. Omit for a category-only phrasing (Chi phí, Hoá đơn
   * nhà cung cấp already show that name in the header, not here again).
   */
  entity?: string;
  /** The toast title on success — each screen's own exact wording. */
  successMessage: string;
  redirectTo: string;
}

/**
 * Xoá — hỏi xác nhận "không thể hoàn tác", xoá xong toast rồi về danh sách
 * không thể Back lại (spec #221 ticket T5). One hook for the six screens that
 * delete: `ConfirmActionDialog`'s copy lives here, not re-typed six times.
 */
export function useDeleteEntity({
  mutation,
  id,
  label,
  entity,
  successMessage,
  redirectTo,
}: UseDeleteEntityOptions) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dialogProps = {
    open,
    onOpenChange: setOpen,
    title: `Xóa ${label}`,
    description: `Bạn có chắc chắn muốn xóa ${label}${
      entity ? ` "${entity}"` : ""
    } không? Hành động này không thể hoàn tác.`,
    actionLabel: "Xóa",
    variant: "destructive" as const,
    isPending: mutation.isPending,
    onConfirm: () => {
      mutation.mutate(id, {
        onSuccess: () => {
          toast.add({ title: successMessage, type: "success" });
          setOpen(false);
          navigate(redirectTo, { replace: true });
        },
      });
    },
  };

  return { open, onOpen: () => setOpen(true), dialogProps };
}
