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
  return `${"http://localhost:3000"}/api/sitemaps/${path}/${getFileName(id)}`;
}
function getSitemap(path: string, id?: number) {
  return /* XML */ `<sitemap><loc>${getLoc(path, id)}</loc><lastmod>${new Date().toISOString()}</lastmod></sitemap>`;
}

export async function GET() {
  const xml = /* XML */ `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${getSitemap("common")}
    </sitemapindex>
  `;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
