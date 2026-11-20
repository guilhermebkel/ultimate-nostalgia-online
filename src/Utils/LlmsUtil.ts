import type { Game, Locale } from "@/Protocols/SiteProtocol";

export class LlmsUtil {
  static build(games: Game[], english: Locale): string {
    const texts = english.games as Record<string, { name: string; text: string }>;
    const live = games
      .filter((game) => game.status === "live")
      .map((game) => `- [${texts[game.id]?.name}](${game.url}): ${texts[game.id]?.text}`)
      .join("\n");
    const soon = games
      .filter((game) => game.status === "soon")
      .map((game) => `- ${texts[game.id]?.name}: ${texts[game.id]?.text}`)
      .join("\n");
    return `# uno\n\n> uno (Ultimate Nostalgia Online) is a hub of famous games remastered with multiplayer and new mechanics, to play with friends in the browser.\n\n## Games\n\n${live}\n\n## Coming soon\n\n${soon}\n`;
  }
}
