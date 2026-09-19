import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { describe, expect, it, vi } from "vitest";

import { Toaster } from "@monorepo/ui/components/toast";

import { ConfirmActionDialog } from "~/components/dialog/confirm-action-dialog";
import { useDeleteEntity } from "~/hooks/use-delete-entity";

function fakeMutation() {
  const mutate = vi.fn((_id: string, options?: { onSuccess?: () => void }) =>
    options?.onSuccess?.(),
  );
  return { isPending: false, mutate };
}

function Harness({
  mutation,
}: {
  mutation: ReturnType<typeof fakeMutation>;
}) {
  const deleteRoom = useDeleteEntity({
    mutation,
    id: "R-1",
    label: "phòng",
    entity: "Phòng 101",
    successMessage: "Đã xóa Phòng 101",
    redirectTo: "/rooms",
  });

  return (
    <>
      <button type="button" onClick={deleteRoom.onOpen}>
        Xóa
      </button>
      <ConfirmActionDialog {...deleteRoom.dialogProps} />
    </>
  );
}

function renderHarness(mutation: ReturnType<typeof fakeMutation>) {
  const router = createMemoryRouter(
    [
      { path: "/", element: <Harness mutation={mutation} /> },
      { path: "/rooms", element: <p>Danh sách phòng</p> },
    ],
    { initialEntries: ["/"] },
  );
  render(
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>,
  );
  return router;
}

describe("useDeleteEntity", () => {
  it("opens the confirm dialog with the entity's own copy", async () => {
    const user = userEvent.setup();
    renderHarness(fakeMutation());

    await user.click(screen.getByRole("button", { name: "Xóa" }));

    expect(
      screen.getByRole("alertdialog", { name: "Xóa phòng" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Bạn có chắc chắn muốn xóa phòng "Phòng 101" không? Hành động này không thể hoàn tác.',
      ),
    ).toBeInTheDocument();
  });

  it("confirm mutates, toasts, closes the dialog and navigates with replace", async () => {
    const user = userEvent.setup();
    const mutation = fakeMutation();
    const router = renderHarness(mutation);

    await user.click(screen.getByRole("button", { name: "Xóa" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Xóa",
      }),
    );

    expect(mutation.mutate).toHaveBeenCalledWith(
      "R-1",
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(await screen.findByText("Đã xóa Phòng 101")).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/rooms");
    expect(router.state.historyAction).toBe("REPLACE");
  });

  it("cancel closes the dialog without mutating", async () => {
    const user = userEvent.setup();
    const mutation = fakeMutation();
    renderHarness(mutation);

    await user.click(screen.getByRole("button", { name: "Xóa" }));
    await user.click(screen.getByRole("button", { name: "Hủy" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(mutation.mutate).not.toHaveBeenCalled();
  });
});
