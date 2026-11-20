import { ArrowIcon } from "@/components/Icons/ArrowIcon";
import { BUTTON_LIVE } from "./GameCardClasses";

type GameCardLinksProps = { url: string; cta: string };

// Why: the banner link makes the whole card clickable for the pointer, and the button is the one a keyboard and a screen reader reach.
export const GameCardLinks = ({ url, cta }: GameCardLinksProps) => (
  <>
    <a
      className="absolute inset-0 z-[9] rounded-[inherit]"
      href={url}
      target="_blank"
      rel="noopener"
      data-track-click="banner"
      aria-hidden="true"
      tabIndex={-1}
    />
    <div className="relative z-[10] mt-[22px]">
      <a className={BUTTON_LIVE} href={url} target="_blank" rel="noopener" data-track-click="button">
        <span>{cta}</span>
        <ArrowIcon />
      </a>
    </div>
  </>
);
