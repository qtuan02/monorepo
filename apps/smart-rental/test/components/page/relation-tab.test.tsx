import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RelationTab } from "~/components/page/relation-tab";

interface Item {
  id: string;
  name: string;
}

describe("RelationTab", () => {
  it("shows the empty panel with the given copy when items is empty", () => {
    render(
      <RelationTab<Item>
        items={[]}
        empty={{ title: "Chưa có hợp đồng", description: "Gợi ý ở đây." }}
      >
        {(item) => <p>{item.name}</p>}
      </RelationTab>,
    );

    expect(screen.getByText("Chưa có hợp đồng")).toBeInTheDocument();
    expect(screen.getByText("Gợi ý ở đây.")).toBeInTheDocument();
  });

  it("renders one child per item when there are items", () => {
    render(
      <RelationTab<Item>
        items={[
          { id: "1", name: "Hợp đồng 1" },
          { id: "2", name: "Hợp đồng 2" },
        ]}
        empty={{ title: "Chưa có" }}
      >
        {(item) => <p>{item.name}</p>}
      </RelationTab>,
    );

    expect(screen.getByText("Hợp đồng 1")).toBeInTheDocument();
    expect(screen.getByText("Hợp đồng 2")).toBeInTheDocument();
    expect(screen.queryByText("Chưa có")).not.toBeInTheDocument();
  });
});
