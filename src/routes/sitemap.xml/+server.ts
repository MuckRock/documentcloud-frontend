import { APP_URL } from "@/config/config";

function getUrl(path: string): string {
  return new URL(path, APP_URL).href;
}

function getLastMod(): string {
  return "2024-09-30";
}

async function getUrls() {
  return [
    { loc: "/", lastmod: getLastMod() },
    { loc: "/documents/", lastmod: getLastMod() },
    { loc: "/projects/", lastmod: getLastMod() },
    { loc: "/add-ons/", lastmod: getLastMod() },
    { loc: "/help/", lastmod: getLastMod() },
    { loc: "/home/", lastmod: getLastMod() },
  ];
}

export async function GET() {
  const urls = await getUrls();

  const xmlSitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls
        .map(
          (url) => `
        <url>
          <loc>${`${getUrl(url.loc)}`}</loc>
          <lastmod>${url.lastmod}</lastmod>
        </url>`,
        )
        .join("")}
    </urlset>`;

  // Return the XML response with the appropriate headers
  return new Response(xmlSitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
