import type { Metadata, Viewport } from "next";
import { SHARE_IMAGE } from "@/constants/ShareImageConstant";
import type { Locale, Site } from "@/Protocols/SiteProtocol";
import { SiteDataUtil } from "@/Utils/SiteDataUtil";

const THEME_COLOR = "#F5F3EE";

export class MetadataUtil {
  static viewport(): Viewport {
    return { width: "device-width", initialScale: 1, themeColor: THEME_COLOR };
  }

  static languages(): Record<string, string> {
    const { SITE: site } = SiteDataUtil;
    return Object.fromEntries(
      site.locales.map((key) => {
        const locale = SiteDataUtil.localeOf(key);
        return [locale.htmlLang, `${site.url}${locale.path}`];
      }),
    );
  }

  static page(site: Site, locale: Locale): Metadata {
    const languages = MetadataUtil.languages();
    const url = `${site.url}${locale.path}`;
    const image = `${site.url}/og.png`;
    return {
      metadataBase: new URL(site.url),
      title: locale.title,
      description: locale.description,
      alternates: { canonical: url, languages: { ...languages, "x-default": `${site.url}/` } },
      robots: { index: true, follow: true, "max-image-preview": "large" },
      icons: {
        icon: [
          { url: "/favicon.ico", sizes: "48x48" },
          { url: "/favicon.svg", type: "image/svg+xml" },
        ],
        apple: "/apple-touch-icon.png",
      },
      manifest: "/site.webmanifest",
      openGraph: {
        type: "website",
        siteName: site.name,
        title: locale.title,
        description: locale.description,
        url,
        images: [{ url: image, ...SHARE_IMAGE, alt: locale.ogImageAlt }],
        locale: locale.ogLocale,
      },
      twitter: { card: "summary_large_image", title: locale.title, description: locale.description, images: [image] },
    };
  }
}
