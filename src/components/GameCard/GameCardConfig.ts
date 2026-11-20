import type { GameId } from "@/Protocols/SiteProtocol";

export type CardArt =
  | { kind: "fan" }
  | { kind: "image"; src: string; width: number; height: number; className: string }
  | { kind: "ogre"; className: string };

type CardBase = {
  tilt: number;
  className: string;
};

export type LiveCardConfig = CardBase & {
  status: "live";
  heading: "h1" | "h2";
  titleClassName: string;
  textClassName: string;
  art: CardArt;
};

export type SoonCardConfig = CardBase & {
  status: "soon";
  // Why: the wordmark replaces the visible title, so the name stays in the page for screen readers.
  title: { kind: "wordmark" } | { kind: "text"; className: string };
  art: CardArt;
};

export type CardConfig = LiveCardConfig | SoonCardConfig;

export type ArtKind = CardArt["kind"];

export type ArtOfKind<Kind extends ArtKind> = Extract<CardArt, { kind: Kind }>;

// Why: keyed by GameId, so a game added to the union does not compile until it has a card; games.json is checked against the union by a test.
export const GAME_ID_TO_CARD_CONFIG: Record<GameId, CardConfig> = {
  zerod: {
    status: "live",
    heading: "h1",
    tilt: 8,
    className:
      "col-span-full min-h-[600px] bg-zerod p-(--pad) pb-[calc(var(--pad)+var(--cw)*1.75+28px)] text-white [--cw:min(25vw,130px)] [--pad:clamp(24px,3.2vw,48px)] hub:min-h-0 hub:pb-(--pad) hub:[--cw:clamp(112px,min(10vw,18vh),160px)] motion-safe:animate-pop-1",
    titleClassName: "mt-[18px] text-[clamp(3.4rem,1rem+6vw,7rem)]",
    textClassName: "mt-[18px]",
    art: { kind: "fan" },
  },
  "heros-play": {
    status: "live",
    heading: "h2",
    tilt: 8,
    className:
      "col-span-full min-h-[420px] overflow-visible bg-heros p-(--pad) pb-[calc(var(--pad)+var(--pw)+36px)] text-[#f6e7c8] [--pad:clamp(24px,3.2vw,48px)] [--pw:min(62vw,300px)] hub:min-h-[340px] hub:pb-(--pad) motion-safe:animate-pop-2",
    titleClassName: "mt-[14px] text-[clamp(2.6rem,1rem+4.4vw,5.2rem)] leading-[.95]",
    textClassName: "mt-4",
    art: {
      kind: "image",
      src: "/img/heros-play.webp",
      width: 560,
      height: 550,
      className:
        "absolute left-1/2 bottom-[24px] z-[3] w-(--pw) -translate-x-1/2 rotate-[calc(-4deg+var(--tilt,0)*1deg)] rounded-[10px] transition-[rotate] duration-[400ms] ease-out shadow-[0_18px_34px_rgb(0_0_0/.45)] hub:top-1/2 hub:right-[5%] hub:left-auto hub:bottom-auto hub:translate-x-0 hub:w-[clamp(240px,24vw,360px)] hub:-translate-y-1/2",
    },
  },
  pebo: {
    status: "soon",
    tilt: 10,
    className: "bg-pebo motion-safe:animate-pop-2",
    title: { kind: "wordmark" },
    art: {
      kind: "image",
      src: "/img/pebo-figure.png",
      width: 225,
      height: 532,
      className:
        "absolute right-[4%] bottom-[-3%] z-[3] h-full w-auto origin-bottom rotate-[calc(4deg+var(--tilt,0)*1deg)] [filter:drop-shadow(0_14px_16px_rgb(0_0_0/.3))_grayscale(.9)_brightness(.97)] transition-[rotate,scale] duration-[400ms] ease-out group-hover:scale-[1.05] hub:right-[6%] hub:h-[104%] motion-safe:animate-bob-slow",
    },
  },
  "ogro-party": {
    status: "soon",
    tilt: 10,
    className: "bg-ogro motion-safe:animate-pop-3",
    title: { kind: "text", className: "text-[clamp(2.2rem,.8rem+2.6vw,3.6rem)]" },
    art: {
      kind: "ogre",
      className:
        "absolute right-0 bottom-[5%] z-[3] w-[108px] rotate-[calc(6deg+var(--tilt,0)*1deg)] [filter:drop-shadow(0_14px_16px_rgb(0_0_0/.3))_grayscale(.9)_brightness(.97)] transition-[rotate,scale] duration-[400ms] ease-out group-hover:scale-[1.05] hub:right-[-2%] hub:bottom-[3%] hub:w-[clamp(150px,15vw,230px)] motion-safe:animate-bob-fast",
    },
  },
};
