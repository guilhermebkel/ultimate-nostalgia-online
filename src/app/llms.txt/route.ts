import { LlmsUtil } from "@/Utils/LlmsUtil";
import { SiteDataUtil } from "@/Utils/SiteDataUtil";

export const dynamic = "force-static";

export function GET() {
  const english = SiteDataUtil.localeOf(SiteDataUtil.SITE.defaultLocale);
  return new Response(LlmsUtil.build(SiteDataUtil.GAMES, english), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
