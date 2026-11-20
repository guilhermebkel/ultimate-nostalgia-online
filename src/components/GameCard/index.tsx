import type { ReactElement } from "react";
import type { Game, GameStatus, Locale } from "@/Protocols/SiteProtocol";
import type { CardConfig, LiveCardConfig, SoonCardConfig } from "./GameCardConfig";
import { GAME_ID_TO_CARD_CONFIG } from "./GameCardConfig";
import { LiveGameCard } from "./LiveGameCard";
import { SoonGameCard } from "./SoonGameCard";

type GameCardProps = { game: Game; locale: Locale };

type GameText = { name: string; text: string };

type CardProps = { game: Game; config: CardConfig; locale: Locale; text: GameText };

const isLiveConfig = (config: CardConfig): config is LiveCardConfig => config.status === "live";

const isSoonConfig = (config: CardConfig): config is SoonCardConfig => config.status === "soon";

const buildMismatchError = ({ game, config }: CardProps): Error =>
  new Error(`Game "${game.id}" is "${game.status}" in games.json but its card is "${config.status}".`);

const STATUS_TO_CARD: Record<GameStatus, (props: CardProps) => ReactElement> = {
  live: (props) => {
    const { game, config, locale, text } = props;
    if (!isLiveConfig(config) || game.url === undefined) {
      throw buildMismatchError(props);
    }
    return <LiveGameCard game={{ ...game, url: game.url }} config={config} locale={locale} text={text} />;
  },
  soon: (props) => {
    const { game, config, locale, text } = props;
    if (!isSoonConfig(config) || game.url !== undefined) {
      throw buildMismatchError(props);
    }
    return <SoonGameCard game={game} config={config} locale={locale} text={text} />;
  },
};

export const GameCard = ({ game, locale }: GameCardProps) => {
  const config = GAME_ID_TO_CARD_CONFIG[game.id];
  const text: GameText = locale.games[game.id];
  return STATUS_TO_CARD[game.status]({ game, config, locale, text });
};
