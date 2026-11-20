import { UnoLogoIcon } from "@/components/Icons/UnoLogoIcon";
import type { Locale, Site } from "@/Protocols/SiteProtocol";

type SiteHeaderProps = { site: Site; locale: Locale };

export const SiteHeader = ({ site, locale }: SiteHeaderProps) => (
  <header className="relative z-[2] flex flex-col items-center gap-3.5 px-gutter pt-10 pb-8 text-center motion-safe:animate-rise hub:pb-9">
    <a className="logo-link flex-none" href="./" aria-label={site.name}>
      <UnoLogoIcon />
    </a>
    <p className="max-w-[34ch] font-display text-[clamp(1.3rem,.9rem+1.2vw,2.1rem)] leading-[1.12] font-semibold tracking-[-.02em] text-brand-navy">
      {locale.intro}
    </p>
  </header>
);
