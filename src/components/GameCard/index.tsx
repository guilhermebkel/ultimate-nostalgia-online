import type { ReactElement } from "react";
import type { Game, GameStatus, Locale } from "@/Protocols/SiteProtocol";
import type { CardTheme, LiveCardTheme, SoonCardTheme } from "./GameCardTheme";
import { GAME_ID_TO_CARD_THEME } from "./GameCardTheme";
import { LiveGameCard } from "./LiveGameCard";
import { SoonGameCard } from "./SoonGameCard";

type GameCardProps = { game: Game; locale: Locale };

type GameText = { name: string; text: string };

type CardProps = { game: Game; theme: CardTheme; locale: Locale; text: GameText };

const isLiveTheme = (theme: CardTheme): theme is LiveCardTheme => theme.status === "live";

const isSoonTheme = (theme: CardTheme): theme is SoonCardTheme => theme.status === "soon";

const buildMismatchError = ({ game, theme }: CardProps): Error =>
  new Error(`Game "${game.id}" is "${game.status}" in games.json but its card is "${theme.status}".`);

const STATUS_TO_CARD: Record<GameStatus, (props: CardProps) => ReactElement> = {
  live: (props) => {
    const { game, theme, locale, text } = props;
    if (!isLiveTheme(theme) || game.url === undefined) {
      throw buildMismatchError(props);
    }
    return <LiveGameCard game={{ ...game, url: game.url }} theme={theme} locale={locale} text={text} />;
  },
  soon: (props) => {
    const { game, theme, locale, text } = props;
    if (!isSoonTheme(theme) || game.url !== undefined) {
      throw buildMismatchError(props);
    }
    return <SoonGameCard game={game} theme={theme} locale={locale} text={text} />;
  },
};

export const GameCard = ({ game, locale }: GameCardProps) => {
  const theme = GAME_ID_TO_CARD_THEME[game.id];
  const text: GameText = locale.games[game.id];
  return STATUS_TO_CARD[game.status]({ game, theme, locale, text });
};
