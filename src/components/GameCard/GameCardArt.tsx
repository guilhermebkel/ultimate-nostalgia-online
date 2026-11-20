import { OgreIcon } from "@/components/Icons/OgreIcon";
import { FanArt } from "./FanArt";
import type { CardArt } from "./GameCardConfig";

type GameCardArtProps = { art: CardArt };

export const GameCardArt = ({ art }: GameCardArtProps) => {
  if (art.kind === "fan") {
    return <FanArt />;
  }
  if (art.kind === "image") {
    return (
      <img
        data-tilt-target
        className={art.className}
        src={art.src}
        width={art.width}
        height={art.height}
        alt=""
        aria-hidden="true"
      />
    );
  }
  return (
    <div data-tilt-target className={art.className} aria-hidden="true">
      <OgreIcon />
    </div>
  );
};
