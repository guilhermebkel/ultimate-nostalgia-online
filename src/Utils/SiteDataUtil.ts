import gamesJson from "@/data/games.json";
import siteJson from "@/data/site.json";
import en from "@/locales/en.json";
import ptBr from "@/locales/pt-br.json";
import type { Game, Locale, Site } from "@/Protocols/SiteProtocol";

export class SiteDataUtil {
  static readonly SITE: Site = siteJson;

  static readonly GAMES: Game[] = gamesJson as Game[];

  private static readonly LOCALES: Record<string, Locale> = { en, "pt-br": ptBr };

  static localeOf(key: string): Locale {
    const locale = SiteDataUtil.LOCALES[key];
    if (locale === undefined) {
      throw new Error(`Unknown locale "${key}". Add it to src/locales/ and to SiteDataUtil.`);
    }
    return locale;
  }

  static urlOf(locale: Locale): string {
    return `${SiteDataUtil.SITE.url}${locale.path}`;
  }
}
