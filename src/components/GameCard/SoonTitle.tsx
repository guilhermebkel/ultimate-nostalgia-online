import { PeboWordmarkIcon } from "@/components/Icons/PeboWordmarkIcon";
import type { SoonCardConfig } from "./GameCardConfig";

export const SoonTitle = ({ config, id, name }: { config: SoonCardConfig; id: string; name: string }) => {
  if (config.title.kind === "wordmark") {
    return (
      <>
        <h2 id={id} className="sr-only">
          {name}
        </h2>
        <div aria-hidden="true">
          <PeboWordmarkIcon />
        </div>
      </>
    );
  }
  return (
    <h2 id={id} className={`font-display leading-[.92] font-bold tracking-[-.03em] ${config.title.className}`}>
      {name}
    </h2>
  );
};
