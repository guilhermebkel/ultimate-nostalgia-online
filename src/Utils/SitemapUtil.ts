import type { Site } from "@/Protocols/SiteProtocol";
import { SiteDataUtil } from "@/Utils/SiteDataUtil";

export class SitemapUtil {
  static build(site: Site, modified: string): string {
    const entries = site.locales.map((key) => SiteDataUtil.localeOf(key));
    const alternates = entries
      .map(
        (locale) => `    <xhtml:link rel="alternate" hreflang="${locale.htmlLang}" href="${site.url}${locale.path}"/>`,
      )
      .join("\n");
    const urls = entries
      .map(
        (locale) =>
          `  <url>\n    <loc>${site.url}${locale.path}</loc>\n    <lastmod>${modified}</lastmod>\n${alternates}\n  </url>`,
      )
      .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
  }
}
