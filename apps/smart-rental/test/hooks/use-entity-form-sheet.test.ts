import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as z from "zod";

import { toast } from "@monorepo/ui/components/toast";

import { useEntityFormSheet } from "~/hooks/use-entity-form-sheet";

interface Entity {
  id: string;
  name: string;
}

const schema = z.object({
  name: z.string().trim().min(1, { error: "Bắt buộc" }),
});

function toDefaultValues(entity?: Entity) {
  return { name: entity?.name ?? "" };
}

function fakeMutation(result: Entity = { id: "created", name: "Kết quả" }) {
  return {
    isPending: false,
    mutate: vi.fn(
      (_payload: unknown, options?: { onSuccess?: (data: Entity) => void }) =>
        options?.onSuccess?.(result),
    ),
  };
}

const fakeEvent = { preventDefault: () => {} } as never;

function renderSheet(entity: Entity | undefined, open: boolean) {
  const onOpenChange = vi.fn();
  const create = fakeMutation();
  const update = fakeMutation();
  const view = renderHook(
    (props: { entity: Entity | undefined; open: boolean }) =>
      useEntityFormSheet({
        open: props.open,
        onOpenChange,
        schema,
        entity: props.entity,
        toDefaultValues,
        mutations: { create, update },
        successMessage: () => "Đã lưu",
      }),
    { initialProps: { entity, open } },
  );
  return { ...view, onOpenChange, create, update };
}

describe("useEntityFormSheet", () => {
  it("mở lại sau khi huỷ một form dở thì reset về defaults", () => {
    const { result, rerender } = renderSheet(undefined, true);

    act(() =>
      result.current.form.setValue("name", "gõ dở", { shouldDirty: true }),
    );
    expect(result.current.form.getValues("name")).toBe("gõ dở");

    // Hủy — the sheet's own `open` flips to false, then reopens.
    rerender({ entity: undefined, open: false });
    rerender({ entity: undefined, open: true });

    expect(result.current.form.getValues("name")).toBe("");
    expect(result.current.form.formState.isDirty).toBe(false);
  });

  it("mở với entity A rồi đóng mở lại với entity B thì form là B", () => {
    const a: Entity = { id: "a", name: "A" };
    const b: Entity = { id: "b", name: "B" };
    const { result, rerender } = renderSheet(a, true);

    expect(result.current.form.getValues("name")).toBe("A");

    rerender({ entity: a, open: false });
    rerender({ entity: b, open: true });

    expect(result.current.form.getValues("name")).toBe("B");
  });

  it("calls update, never create, when an entity is present", async () => {
    const entity: Entity = { id: "e1", name: "A" };
    const { result, create, update } = renderSheet(entity, true);

    await act(async () => {
      await result.current.sheetProps.onSubmit(fakeEvent);
    });

    expect(update.mutate).toHaveBeenCalledTimes(1);
    expect(create.mutate).not.toHaveBeenCalled();
  });

  it("calls create, never update, when no entity is present", async () => {
    const { result, create, update } = renderSheet(undefined, true);
    act(() =>
      result.current.form.setValue("name", "Mới", { shouldDirty: true }),
    );

    await act(async () => {
      await result.current.sheetProps.onSubmit(fakeEvent);
    });

    expect(create.mutate).toHaveBeenCalledTimes(1);
    expect(update.mutate).not.toHaveBeenCalled();
  });

  it("toasts and closes the sheet once the save succeeds", async () => {
    const toastSpy = vi
      .spyOn(toast, "add")
      .mockImplementation(() => "toast-id" as never);
    const { result, onOpenChange } = renderSheet(undefined, true);
    act(() =>
      result.current.form.setValue("name", "Mới", { shouldDirty: true }),
    );

    await act(async () => {
      await result.current.sheetProps.onSubmit(fakeEvent);
    });

    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Đã lưu", type: "success" }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);

    toastSpy.mockRestore();
  });
});
