import type { Game, Locale, Site } from "@/Protocols/SiteProtocol";

type JsonLdInput = { site: Site; locale: Locale; games: Game[] };

export class JsonLdUtil {
  static graph({ site, locale, games }: JsonLdInput) {
    const liveGames = games.filter((game) => game.status === "live");
    const pageUrl = `${site.url}${locale.path}`;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${site.url}/#website`,
          url: `${site.url}/`,
          name: site.name,
          alternateName: "Ultimate Nostalgia Online",
          description: locale.description,
          inLanguage: locale.htmlLang,
          publisher: { "@id": `${site.url}/#autor` },
        },
        {
          "@type": "Person",
          "@id": `${site.url}/#autor`,
          name: site.author.name,
          url: site.author.url,
          sameAs: [site.author.url, site.repo],
        },
        ...liveGames.map((game) => JsonLdUtil.application(site, locale, game)),
        {
          "@type": "WebPage",
          "@id": `${pageUrl}#pagina`,
          url: pageUrl,
          name: locale.title,
          inLanguage: locale.htmlLang,
          isPartOf: { "@id": `${site.url}/#website` },
          about: liveGames.map((game) => ({ "@id": JsonLdUtil.appId(game) })),
          primaryImageOfPage: { "@type": "ImageObject", url: `${site.url}/og.png`, width: 1200, height: 630 },
        },
      ],
    };
  }

  // Why: the id is the game url plus "#app", and a url that already ends in a slash must not get a second one.
  private static appId(game: Game): string {
    return `${(game.url ?? "").replace(/\/$/, "")}/#app`;
  }

  private static application(site: Site, locale: Locale, game: Game) {
    const text = JsonLdUtil.textOf(locale, game);
    return {
      "@type": "WebApplication",
      "@id": JsonLdUtil.appId(game),
      name: text.name,
      url: game.url,
      description: text.text,
      applicationCategory: "GameApplication",
      operatingSystem: "Any (web browser)",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@id": `${site.url}/#autor` },
    };
  }

  private static textOf(locale: Locale, game: Game) {
    const text = (locale.games as Record<string, { name: string; text: string } | undefined>)[game.id];
    if (text === undefined) {
      throw new Error(`Game "${game.id}" has no text in the locale files.`);
    }
    return text;
  }
}
