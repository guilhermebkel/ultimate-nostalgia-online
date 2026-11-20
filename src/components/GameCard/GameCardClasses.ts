export const SLAB =
  "relative rounded-[30px] shadow-[0_18px_38px_rgb(20_17_15/.16)] transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-[5px] hover:shadow-[0_26px_46px_rgb(20_17_15/.22)]";

const BUTTON =
  "inline-flex items-center gap-3 whitespace-nowrap rounded-[14px] font-display font-semibold no-underline transition-[translate,background-color] duration-150 ease-out";

// Why: the arrow slide on hover is the `.cta svg` rule in globals.css, so the class has to stay on the button.
export const BUTTON_LIVE = `${BUTTON} h-14 bg-white px-[26px] text-[1.15rem] text-ink hover:-translate-y-0.5 hover:bg-[#ffe27a] active:translate-y-px max-[420px]:w-full max-[420px]:justify-center cta`;

export const SOON_CARD =
  "group flex min-h-[220px] flex-col justify-end pt-[50px] pr-[clamp(20px,2.2vw,32px)] pb-[clamp(16px,1.8vw,26px)] pl-[clamp(20px,2.2vw,32px)] text-white hub:min-h-[240px] [&>.status]:absolute [&>.status]:top-[clamp(16px,1.8vw,24px)] [&>.status]:left-[clamp(20px,2.2vw,32px)] overflow-visible";

export const SOON_COPY = "relative z-[4] text-white grayscale-[.9] brightness-[.97] hub:max-w-[62%]";

export const SOON_BODY = "mt-1.5 max-w-[30ch] text-[.9rem] leading-[1.4] font-medium";

export const LIVE_TITLE_BASE = "relative z-[2] font-display leading-[.92] font-bold tracking-[-.03em]";

export const LIVE_TEXT = "relative z-[2] max-w-[40ch] text-[clamp(1rem,.9rem+.4vw,1.1875rem)] font-medium";
