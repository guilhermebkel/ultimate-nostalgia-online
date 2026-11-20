import type { Locale, Site } from "@/Protocols/SiteProtocol";

type SiteFooterProps = { site: Site; locale: Locale };

// Why: the underline fills with the card yellow on hover and focus; both states share one class string.
const FOOTER_LINK =
  "-mx-1.5 rounded-md bg-[linear-gradient(var(--color-brand-yellow),var(--color-brand-yellow))] bg-size-[100%_2px] bg-bottom bg-no-repeat px-1.5 py-1.5 text-inherit no-underline transition-[background-size,color] duration-200 ease-out hover:bg-size-[100%_100%] hover:text-ink focus-visible:bg-size-[100%_100%] focus-visible:text-ink motion-reduce:transition-none";

export const SiteFooter = ({ site, locale }: SiteFooterProps) => {
  const links = [
    { track: "feedback", href: site.feedbackUrl, label: locale.feedbackLink },
    { track: "issue", href: `${site.repo}/issues/new/choose`, label: locale.issueLink },
    { track: "github", href: site.repo, label: locale.githubLink },
  ];
  return (
    <footer className="relative z-[2] flex min-h-24 items-center justify-between gap-4 px-gutter pt-6 pb-7 text-[.9375rem] font-semibold text-ink-soft max-[560px]:items-start">
      <p className="max-[560px]:[&>span:not([aria-hidden])]:block">
        <span className="font-semibold">{locale.expansion.join(" ")}</span>
        <span className="max-[560px]:hidden" aria-hidden="true">
          {" · "}
        </span>
        <span>{locale.moreGames}</span>
      </p>
      <nav
        className="flex flex-wrap justify-end gap-x-6 gap-y-1 max-[560px]:flex-col max-[560px]:items-end"
        aria-label={locale.feedbackLink}
      >
        {links.map((link) => (
          <a
            key={link.track}
            className={FOOTER_LINK}
            href={link.href}
            target="_blank"
            rel="noopener"
            data-track-link={link.track}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
};
