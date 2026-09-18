import { describe, expect, it } from "vitest";

import {
  MCP_ENDPOINT_PATH,
  MCP_TOOLS,
} from "~/features/weather/constants/tools";

/**
 * The tool names are a wire contract another backend already calls, so they are
 * pinned as literals here rather than derived from the array under test —
 * deriving them would make a rename pass silently, which is the one failure this
 * file exists to catch. The E2E asserts the same three names come back from
 * `tools/list`; this asserts the page and the registration read them from one
 * place.
 */
describe("the MCP tool catalogue", () => {
  it("carries exactly the three tools the endpoint has always exposed", () => {
    expect(MCP_TOOLS.map((tool) => tool.name)).toEqual([
      "hello-world",
      "get-weather",
      "get-forecast",
    ]);
  });

  it("names the endpoint the route handler actually serves", () => {
    // The placeholder page prints this constant while the E2E calls the literal
    // path, so without this pin the two could drift and both still pass: the
    // page would advertise a URL nobody serves. `src/app/api/mcp/route.ts` is
    // the folder that has to match.
    expect(MCP_ENDPOINT_PATH).toBe("/api/mcp");
  });

  it("gives every tool a title and a description for tools/list", () => {
    for (const tool of MCP_TOOLS) {
      expect(tool.title.length).toBeGreaterThan(0);
      expect(tool.description.length).toBeGreaterThan(0);
    }
  });
});
