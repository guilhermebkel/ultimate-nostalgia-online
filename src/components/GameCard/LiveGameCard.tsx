import type { Game, Locale } from "@/Protocols/SiteProtocol";
import { GameCardArt } from "./GameCardArt";
import { LIVE_TEXT, LIVE_TITLE_BASE, SLAB } from "./GameCardClasses";
import type { LiveCardConfig } from "./GameCardConfig";
import { GameCardLinks } from "./GameCardLinks";
import { GameCardStatus } from "./GameCardStatus";

type LiveGameCardProps = {
  game: Game & { url: string };
  config: LiveCardConfig;
  locale: Locale;
  text: { name: string; text: string };
};

export const LiveGameCard = ({ game, config, locale, text }: LiveGameCardProps) => {
  const Heading = config.heading;
  const titleId = `${game.id}-title`;
  return (
    <section
      id={game.id}
      aria-labelledby={titleId}
      data-track-card={game.id}
      data-track-status="live"
      data-tilt-card={config.tilt}
      className={`group ${SLAB} flex flex-col justify-center ${config.className}`}
    >
      <GameCardStatus status="live" label={locale.status.live} />
      <Heading id={titleId} className={`${LIVE_TITLE_BASE} ${config.titleClassName}`}>
        {text.name}
      </Heading>
      <p className={`${LIVE_TEXT} ${config.textClassName}`}>{text.text}</p>
      <GameCardLinks url={game.url} cta={locale.cta.live} />
      <GameCardArt art={config.art} />
    </section>
  );
};
