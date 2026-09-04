import { useTranslations } from "next-intl";

import { PageContent } from "~/components/page/page-content";
import { PageHeader } from "~/components/page/page-header";
import ToolCard from "~/features/weather/components/tool-card";
import {
  MCP_ENDPOINT_PATH,
  MCP_TOOLS,
} from "~/features/weather/constants/tools";

/**
 * The placeholder page. This app's product is the endpoint, not a screen, so the
 * page's only job is to say so — what the URL is, and which tools answer on it.
 *
 * The list is the same `MCP_TOOLS` the MCP server registers from, so the page
 * cannot advertise a tool the endpoint does not serve. Everything here renders
 * on the server and ships no JavaScript.
 */
export default function McpOverviewTemplate() {
  const t = useTranslations();

  return (
    <>
      <PageHeader
        title={t("mcpWeather.home.title")}
        description={t("mcpWeather.home.description", {
          endpoint: MCP_ENDPOINT_PATH,
        })}
      />
      <PageContent>
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {t("mcpWeather.tools.title")}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MCP_TOOLS.map((tool) => (
              <ToolCard
                key={tool.name}
                name={tool.name}
                title={tool.title}
                description={tool.description}
              />
            ))}
          </div>
        </section>
      </PageContent>
    </>
  );
}
