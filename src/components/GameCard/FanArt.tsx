import type { CSSProperties } from "react";

type FanCard = { k: number; z: number; color: string; symbol?: string; className?: string };

const FAN_CARDS: FanCard[] = [
  { k: -2, z: 1, color: "var(--color-card-blue)", symbol: "5" },
  { k: -1, z: 2, color: "var(--color-card-red)", symbol: "7" },
  { k: 0, z: 3, color: "var(--color-card-yellow)", symbol: "0", className: "y" },
  { k: 1, z: 4, color: "var(--color-card-green)", symbol: "2" },
  { k: 2, z: 5, color: "var(--color-card-dark)", className: "dark" },
];

const WHEEL = [
  { fill: "#F14A43", d: "M128.00 48.00A80.00 80.00 0 0 1 208.00 128.00L180.99 128.00A52.99 52.99 0 0 0 128.00 75.01Z" },
  {
    fill: "#FDCC31",
    d: "M208.00 128.00A80.00 80.00 0 0 1 128.00 208.00L128.00 180.99A52.99 52.99 0 0 0 180.99 128.00Z",
  },
  { fill: "#44C875", d: "M128.00 208.00A80.00 80.00 0 0 1 48.00 128.00L75.01 128.00A52.99 52.99 0 0 0 128.00 180.99Z" },
  { fill: "#397BE9", d: "M48.00 128.00A80.00 80.00 0 0 1 128.00 48.00L128.00 75.01A52.99 52.99 0 0 0 75.01 128.00Z" },
];

const cardStyle = (card: FanCard) => ({ "--k": card.k, "--z": card.z, "--c": card.color }) as CSSProperties;

export const FanArt = () => (
  <div className="fan" aria-hidden="true" id="fan" data-tilt-target>
    {FAN_CARDS.map((card) => (
      <div key={card.k} className={card.className ? `pc ${card.className}` : "pc"} style={cardStyle(card)}>
        {card.symbol === undefined ? (
          <svg viewBox="0 0 256 256" aria-hidden="true">
            <g>
              {WHEEL.map((slice) => (
                <path key={slice.fill} fill={slice.fill} d={slice.d} />
              ))}
            </g>
          </svg>
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
