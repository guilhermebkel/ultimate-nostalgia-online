import type { ReactNode } from "react";
import "../globals.css";
import { HubLayout } from "@/components/HubLayout";
import { MetadataUtil } from "@/Utils/MetadataUtil";
import { SiteDataUtil } from "@/Utils/SiteDataUtil";

export const metadata = MetadataUtil.page(SiteDataUtil.SITE, SiteDataUtil.localeOf("pt-br"));
export const viewport = MetadataUtil.viewport();

export default function PortugueseLayout({ children }: { children: ReactNode }) {
  return <HubLayout localeKey="pt-br">{children}</HubLayout>;
}
