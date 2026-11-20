import type { Game, Locale } from "@/Protocols/SiteProtocol";
import { GameCardArt } from "./GameCardArt";
import { LIVE_TEXT, LIVE_TITLE_BASE, SLAB } from "./GameCardClasses";
import type { LiveCardTheme } from "./GameCardTheme";
import { GameCardLinks } from "./GameCardLinks";
import { GameCardStatus } from "./GameCardStatus";

type LiveGameCardProps = {
  game: Game & { url: string };
  theme: LiveCardTheme;
  locale: Locale;
  text: { name: string; text: string };
};

export const LiveGameCard = ({ game, theme, locale, text }: LiveGameCardProps) => {
  const Heading = theme.heading;
  const titleId = `${game.id}-title`;
  return (
    <section
      id={game.id}
      aria-labelledby={titleId}
      data-track-card={game.id}
      data-track-status="live"
      data-tilt-card={theme.tilt}
      className={`group ${SLAB} flex flex-col justify-center ${theme.className}`}
    >
      <GameCardStatus status="live" label={locale.status.live} />
      <Heading id={titleId} className={`${LIVE_TITLE_BASE} ${theme.titleClassName}`}>
        {text.name}
      </Heading>
      <p className={`${LIVE_TEXT} ${theme.textClassName}`}>{text.text}</p>
      <GameCardLinks url={game.url} cta={locale.cta.live} />
      <GameCardArt art={theme.art} />
    </section>
  );
};
