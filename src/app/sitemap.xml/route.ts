import { GitAdapter } from "@/Adapters/GitAdapter";
import { SitemapUtil } from "@/Utils/SitemapUtil";
import { SiteDataUtil } from "@/Utils/SiteDataUtil";

export const dynamic = "force-static";

export const GET = () => {
  return new Response(SitemapUtil.build(SiteDataUtil.SITE, GitAdapter.lastModified()), {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
};
