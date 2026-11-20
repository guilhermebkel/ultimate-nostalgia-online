import type { Game } from "@/Protocols/SiteProtocol";

export class GameBuilder {
  static live(overrides: Partial<Game> = {}): Game {
    return { id: "zerod", status: "live", url: "https://zerod.example", ...overrides };
  }

  static soon(overrides: Partial<Game> = {}): Game {
    return { id: "pebo", status: "soon", ...overrides };
  }
}
