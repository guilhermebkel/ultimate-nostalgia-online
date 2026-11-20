import { GameCard } from "@/components/GameCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { LocaleKey } from "@/Protocols/SiteProtocol";
import { JsonLdUtil } from "@/Utils/JsonLdUtil";
import { SiteDataUtil } from "@/Utils/SiteDataUtil";

type HubPageProps = { localeKey: LocaleKey };

export const HubPage = ({ localeKey }: HubPageProps) => {
  const { SITE: site, GAMES: games } = SiteDataUtil;
  const locale = SiteDataUtil.localeOf(localeKey);
  return (
    <>
      <a
        className="fixed top-2 left-2 z-[1000] -translate-y-[200%] rounded-lg bg-white px-4 py-2 text-black focus-visible:translate-y-0"
        href="#games"
      >
        {locale.skip}
      </a>
      <div className="grain" aria-hidden="true" />
      <SiteHeader site={site} locale={locale} />
      <main id="games" className="relative z-[2] flex-1 px-gutter pt-4 pb-6">
        <div className="grid grid-cols-1 gap-5 hub:grid-cols-2">
          {games.map((game) => (
            <GameCard key={game.id} game={game} locale={locale} />
          ))}
        </div>
      </main>
      <SiteFooter site={site} locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JsonLdUtil.graph({ site, locale, games })) }}
      />
      <script src="/fan-tilt.js" defer />
      <script src="/tracking.js" defer />
    </>
  );
};
