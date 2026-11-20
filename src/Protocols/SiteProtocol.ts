import type en from "@/locales/en.json";

export type Locale = typeof en;

export type GameStatus = "live" | "soon";

export type GameId = "zerod" | "heros-play" | "pebo" | "ogro-party";

export type LocaleKey = "en" | "pt-br";

export type Game = {
  id: GameId;
  status: GameStatus;
  url?: string;
};

export type Site = {
  url: string;
  name: string;
  repo: string;
  feedbackUrl: string;
  author: { name: string; url: string };
  defaultLocale: LocaleKey;
  locales: LocaleKey[];
  gtmScript: string;
};
