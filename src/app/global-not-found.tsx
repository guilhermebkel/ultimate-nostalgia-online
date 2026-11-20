import "./globals.css";
import type { Metadata } from "next";
import { UnoLogoIcon } from "@/components/Icons/UnoLogoIcon";
import { SiteDataUtil } from "@/Utils/SiteDataUtil";

const locale = SiteDataUtil.localeOf(SiteDataUtil.SITE.defaultLocale);

// Why: Next adds the noindex tag to a not-found page by itself, so the metadata does not repeat it.
export const metadata: Metadata = { title: locale.notFound.title };

export default function GlobalNotFound() {
  return (
    <html lang={locale.htmlLang}>
      <body className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-paper p-6 font-body text-ink">
        <UnoLogoIcon />
        <h1 className="font-display text-3xl font-semibold">{locale.notFound.text}</h1>
        <a
          className="rounded-[14px] bg-ink px-[26px] py-3 font-display text-lg font-semibold text-white no-underline"
          href="/"
        >
          {locale.notFound.home}
        </a>
      </body>
    </html>
  );
}
