import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import {
  MCP_ENDPOINT_PATH,
  MCP_TOOL_NAMES,
} from "~/features/weather/constants/tools";
import McpOverviewTemplate from "~/features/weather/templates/mcp-overview.template";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    // No `title` of its own: the layout's `title.default` is already this app's
    // name, so setting it here would render it twice through the `%s · …`
    // template. The description is the page's own, and it names the endpoint.
    description: t("mcpWeather.home.description", {
      endpoint: MCP_ENDPOINT_PATH,
    }),
    // The tool names are what someone searching for this server would type.
    keywords: [...MCP_TOOL_NAMES],
  };
}

/**
 * The public page, and the whole of it. There is no cached loader between the
 * route and the slice because there is nothing to fetch: the tool catalogue is a
 * constant of the slice that registers those tools, the same way
 * `apps/portfolio` renders a CV that is a constant of its own slice. A
 * `"use cache"` wrapper over a literal array would only be ceremony.
 */
export default function HomePage() {
  return <McpOverviewTemplate />;
}
