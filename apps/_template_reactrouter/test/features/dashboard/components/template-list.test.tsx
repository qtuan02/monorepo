import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Template } from "@monorepo/types/template";

import TemplateList from "~/features/dashboard/components/template-list";
import { templateService } from "~/libs/http-client";
import { render } from "../../../support/render";

/**
 * The mock seam is the **service singleton**, never axios and never the query
 * hook: it is the one place server data enters this app, so a test that mocks it
 * still exercises the hook, the key factory and every branch the component has.
 */
vi.mock("~/libs/http-client", () => ({
  templateService: { getTemplates: vi.fn() },
}));

const getTemplates = vi.mocked(templateService.getTemplates);

const templates: Template[] = [
  { id: "1", name: "Phiếu khám tổng quát" },
  { id: "2", name: "Phiếu xét nghiệm" },
];

describe("TemplateList", () => {
  beforeEach(() => {
    // Set per test rather than once: `clearMocks` resets call history between
    // tests but leaves an implementation in place, and a stale one is worse
    // than none.
    getTemplates.mockReset();
  });

  it("shows a skeleton before the first response lands", () => {
    getTemplates.mockReturnValue(new Promise(() => {}));

    const { container } = render(<TemplateList />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });

  it("renders one row per template once loaded", async () => {
    getTemplates.mockResolvedValue(templates);

    render(<TemplateList />);

    expect(await screen.findByText("Phiếu khám tổng quát")).toBeInTheDocument();
    expect(screen.getByText("Phiếu xét nghiệm")).toBeInTheDocument();
  });

  it("asks for the same page size the dashboard shows, through the service", async () => {
    getTemplates.mockResolvedValue(templates);

    render(<TemplateList />);

    await screen.findByText("Phiếu khám tổng quát");
    // The params reach the service rather than being dropped by the hook — and
    // they are the same object the query key is built from, so two different
    // page sizes cannot share one cache entry.
    expect(getTemplates).toHaveBeenCalledWith({ limit: 6 });
  });

  it("explains an empty list instead of rendering nothing", async () => {
    getTemplates.mockResolvedValue([]);

    render(<TemplateList />);

    expect(
      await screen.findByText(
        "Chưa có template nào. Backend mẫu chưa chạy hoặc chưa có dữ liệu.",
      ),
    ).toBeInTheDocument();
  });

  it("offers a retry when the request fails", async () => {
    getTemplates.mockRejectedValue(new Error("boom"));

    render(<TemplateList />);

    expect(
      await screen.findByText("Đã có lỗi xảy ra, vui lòng thử lại."),
    ).toBeInTheDocument();

    getTemplates.mockResolvedValue(templates);
    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));

    await waitFor(() => {
      expect(screen.getByText("Phiếu khám tổng quát")).toBeInTheDocument();
    });
  });
});
