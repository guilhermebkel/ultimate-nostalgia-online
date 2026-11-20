import { preload } from "react-dom";
import type { ReactNode } from "react";
import type { LocaleKey } from "@/Protocols/SiteProtocol";
import { SiteDataUtil } from "@/Utils/SiteDataUtil";

type HubLayoutProps = { localeKey: LocaleKey; children: ReactNode };

const BODY_CLASS =
  "flex min-h-dvh flex-col overflow-x-clip bg-paper bg-[url(/img/paper.png)] bg-size-[384px_384px] bg-blend-multiply font-body text-base leading-normal text-ink antialiased";

// Why: each language is its own root layout, because <html lang> belongs to the root layout.
export const HubLayout = ({ localeKey, children }: HubLayoutProps) => {
  const locale = SiteDataUtil.localeOf(localeKey);
  for (const font of ["fredoka", "figtree"]) {
    preload(`/fonts/${font}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }
  return (
    <html lang={locale.htmlLang}>
      <script async src={SiteDataUtil.SITE.gtmScript} />
      <body className={BODY_CLASS}>{children}</body>
    </html>
  );
};
