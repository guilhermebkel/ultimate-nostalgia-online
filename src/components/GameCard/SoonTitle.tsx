import { PeboWordmarkIcon } from "@/components/Icons/PeboWordmarkIcon";
import type { SoonCardTheme } from "./GameCardTheme";

export const SoonTitle = ({ theme, id, name }: { theme: SoonCardTheme; id: string; name: string }) => {
  if (theme.title.kind === "wordmark") {
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
    <h2 id={id} className={`font-display leading-[.92] font-bold tracking-[-.03em] ${theme.title.className}`}>
      {name}
    </h2>
  );
};
