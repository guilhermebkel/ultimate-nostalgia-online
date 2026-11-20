import { PeboWordmarkIcon } from "@/components/Icons/PeboWordmarkIcon";
import type { Game, Locale } from "@/Protocols/SiteProtocol";
import { GameCardArt } from "./GameCardArt";
import { SLAB, SOON_BODY, SOON_CARD, SOON_COPY } from "./GameCardClasses";
import type { SoonCardConfig } from "./GameCardConfig";
import { GameCardStatus } from "./GameCardStatus";

type SoonGameCardProps = {
  game: Game;
  config: SoonCardConfig;
  locale: Locale;
  text: { name: string; text: string };
};

const SoonTitle = ({ config, id, name }: { config: SoonCardConfig; id: string; name: string }) => {
  if (config.title.kind === "wordmark") {
    return (
      <>
        <h2 id={id} className="sr-only">
          {name}
        </h2>
        <div aria-hidden="true">
          <PeboWordmarkIcon />
        </div>
      </>
    );
  }
  return (
    <h2 id={id} className={`font-display leading-[.92] font-bold tracking-[-.03em] ${config.title.className}`}>
      {name}
    </h2>
  );
};

// Why: a coming-soon card is not a link, so nothing on it can lead to a game that does not exist yet.
export const SoonGameCard = ({ game, config, locale, text }: SoonGameCardProps) => {
  const titleId = `${game.id}-title`;
  return (
    <article
      aria-labelledby={titleId}
      data-track-card={game.id}
      data-track-status="soon"
      data-tilt-card={config.tilt}
      className={`${SLAB} ${SOON_CARD} ${config.className}`}
    >
      <GameCardStatus status="soon" label={locale.status.soon} />
      <GameCardArt art={config.art} />
      <div className={SOON_COPY}>
        <SoonTitle config={config} id={titleId} name={text.name} />
        <p className={SOON_BODY}>{text.text}</p>
      </div>
    </article>
  );
};
