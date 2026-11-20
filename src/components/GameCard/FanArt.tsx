import type { CSSProperties } from "react";
import { CardWheelIcon } from "@/components/Icons/CardWheelIcon";

type FanCard = { k: number; z: number; color: string; symbol?: string; className?: string };

const FAN_CARDS: FanCard[] = [
  { k: -2, z: 1, color: "var(--color-card-blue)", symbol: "5" },
  { k: -1, z: 2, color: "var(--color-card-red)", symbol: "7" },
  { k: 0, z: 3, color: "var(--color-card-yellow)", symbol: "0", className: "y" },
  { k: 1, z: 4, color: "var(--color-card-green)", symbol: "2" },
  { k: 2, z: 5, color: "var(--color-card-dark)", className: "dark" },
];

const cardStyle = (card: FanCard) => ({ "--k": card.k, "--z": card.z, "--c": card.color }) as CSSProperties;

export const FanArt = () => (
  <div className="fan" aria-hidden="true" id="fan" data-tilt-target>
    {FAN_CARDS.map((card) => (
      <div key={card.k} className={card.className ? `pc ${card.className}` : "pc"} style={cardStyle(card)}>
        {card.symbol === undefined ? (
          <CardWheelIcon />
        ) : (
          <>
            <span className="co a">{card.symbol}</span>
            <span className="n">{card.symbol}</span>
            <span className="co b">{card.symbol}</span>
          </>
        )}
      </div>
    ))}
  </div>
);
