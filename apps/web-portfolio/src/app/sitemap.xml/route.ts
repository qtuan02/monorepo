import { env } from "~/env";
import { generateSitemaps as getSlugSitemaps } from "../api/sitemaps/docs/slug/sitemap";

/**
 * Solution: https://github.com/vercel/next.js/discussions/61025#discussioncomment-9299207
 */
export const revalidate = 3600; // cache for 1 hour

function getFileName(id?: number) {
  if (id == null) {
    return "sitemap.xml";
  }

  return `sitemap/${id}.xml`;
}

function getLoc(path: string, id?: number) {
  return `${env.NEXT_PUBLIC_PORTFOLIO_DOMAIN}/api/sitemaps/${path}/${getFileName(id)}`;
}
function getSitemap(path: string, id?: number) {
  return /* XML */ `<sitemap><loc>${getLoc(path, id)}</loc><lastmod>${new Date().toISOString()}</lastmod></sitemap>`;
}
function getSitemaps(ids: { id: number }[], path: string) {
  return ids.map(({ id }) => getSitemap(path, id)).join("");
}

export async function GET() {
  const xml = /* XML */ `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${getSitemap("common")}
      ${getSitemap("about")}
      ${getSitemap("docs")}
      ${getSitemaps(await getSlugSitemaps(), "docs/slug")}
    </sitemapindex>
  `;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
