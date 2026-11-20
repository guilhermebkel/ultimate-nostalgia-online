import gamesJson from "@/data/games.json";
import siteJson from "@/data/site.json";
import en from "@/locales/en.json";
import ptBr from "@/locales/pt-br.json";
import type { Game, Locale, LocaleKey, Site } from "@/Protocols/SiteProtocol";

export class SiteDataUtil {
  static readonly SITE = siteJson as Site;

  static readonly GAMES: Game[] = gamesJson as Game[];

  private static readonly LOCALE_KEY_TO_LOCALE: Record<LocaleKey, Locale> = { en, "pt-br": ptBr };

  static localeOf(key: LocaleKey): Locale {
    return SiteDataUtil.LOCALE_KEY_TO_LOCALE[key];
  }

  static urlOf(locale: Locale): string {
    return `${SiteDataUtil.SITE.url}${locale.path}`;
  }
}
