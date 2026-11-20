import type { Game, Locale } from "@/Protocols/SiteProtocol";
import { CARD_CONFIGS } from "./GameCardConfig";
import { LiveGameCard } from "./LiveGameCard";
import { SoonGameCard } from "./SoonGameCard";

type GameCardProps = { game: Game; locale: Locale };

type GameText = { name: string; text: string };

const textOf = (locale: Locale, game: Game): GameText => {
  const text = (locale.games as Record<string, GameText | undefined>)[game.id];
  if (text === undefined) {
    throw new Error(`Game "${game.id}" has no text in the locale files.`);
  }
  return text;
};

export const GameCard = ({ game, locale }: GameCardProps) => {
  const config = CARD_CONFIGS[game.id];
  if (config === undefined) {
    throw new Error(`Game "${game.id}" has no card in GameCardConfig. Add one when you add a game.`);
  }
  const text = textOf(locale, game);
  if (config.status === "live" && game.status === "live" && game.url !== undefined) {
    return <LiveGameCard game={{ ...game, url: game.url }} config={config} locale={locale} text={text} />;
  }
  if (config.status === "soon" && game.status === "soon") {
    return <SoonGameCard game={game} config={config} locale={locale} text={text} />;
  }
  throw new Error(`Game "${game.id}" is "${game.status}" in games.json but its card is "${config.status}".`);
};
