import type { ReactElement } from "react";
import { OgreIcon } from "@/components/Icons/OgreIcon";
import { FanArt } from "./FanArt";
import type { ArtKind, ArtOfKind, CardArt } from "./GameCardConfig";

type GameCardArtProps = { art: CardArt };

type ArtRenderer<Kind extends ArtKind> = (art: ArtOfKind<Kind>) => ReactElement;

const ART_KIND_TO_RENDERER: { [Kind in ArtKind]: ArtRenderer<Kind> } = {
  fan: () => <FanArt />,
  image: (art) => (
    <img
      data-tilt-target
      className={art.className}
      src={art.src}
      width={art.width}
      height={art.height}
      alt=""
      aria-hidden="true"
    />
  ),
  ogre: (art) => (
    <div data-tilt-target className={art.className} aria-hidden="true">
      <OgreIcon />
    </div>
  ),
};

export const GameCardArt = ({ art }: GameCardArtProps) => {
  // Why: TypeScript cannot tie `art.kind` to the renderer of that kind, but the map is typed per kind, so the pair always agrees.
  const render = ART_KIND_TO_RENDERER[art.kind] as (art: CardArt) => ReactElement;
  return render(art);
};
