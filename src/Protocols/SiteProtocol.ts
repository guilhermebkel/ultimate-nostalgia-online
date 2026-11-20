import type en from "@/locales/en.json";

export type Locale = typeof en;

export type GameStatus = "live" | "soon";

export type Game = {
  id: string;
  status: GameStatus;
  url?: string;
};

export type Site = {
  url: string;
  name: string;
  repo: string;
  feedbackUrl: string;
  author: { name: string; url: string };
  defaultLocale: string;
  locales: string[];
  gtmScript: string;
};
