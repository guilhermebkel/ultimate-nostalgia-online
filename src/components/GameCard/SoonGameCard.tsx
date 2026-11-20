import type { Game, Locale } from "@/Protocols/SiteProtocol";
import { GameCardArt } from "./GameCardArt";
import { SLAB, SOON_BODY, SOON_CARD, SOON_COPY } from "./GameCardClasses";
import type { SoonCardTheme } from "./GameCardTheme";
import { GameCardStatus } from "./GameCardStatus";
import { SoonTitle } from "./SoonTitle";

type SoonGameCardProps = {
  game: Game;
  theme: SoonCardTheme;
  locale: Locale;
  text: { name: string; text: string };
};

// Why: a coming-soon card is not a link, so nothing on it can lead to a game that does not exist yet.
export const SoonGameCard = ({ game, theme, locale, text }: SoonGameCardProps) => {
  const titleId = `${game.id}-title`;
  return (
    <article
      aria-labelledby={titleId}
      data-track-card={game.id}
      data-track-status="soon"
      data-tilt-card={theme.tilt}
      className={`${SLAB} ${SOON_CARD} ${theme.className}`}
    >
      <GameCardStatus status="soon" label={locale.status.soon} />
      <GameCardArt art={theme.art} />
      <div className={SOON_COPY}>
        <SoonTitle theme={theme} id={titleId} name={text.name} />
        <p className={SOON_BODY}>{text.text}</p>
      </div>
    </article>
  );
};
