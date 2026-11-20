const WHEEL = [
  { fill: "#F14A43", d: "M128.00 48.00A80.00 80.00 0 0 1 208.00 128.00L180.99 128.00A52.99 52.99 0 0 0 128.00 75.01Z" },
  {
    fill: "#FDCC31",
    d: "M208.00 128.00A80.00 80.00 0 0 1 128.00 208.00L128.00 180.99A52.99 52.99 0 0 0 180.99 128.00Z",
  },
  { fill: "#44C875", d: "M128.00 208.00A80.00 80.00 0 0 1 48.00 128.00L75.01 128.00A52.99 52.99 0 0 0 128.00 180.99Z" },
  { fill: "#397BE9", d: "M48.00 128.00A80.00 80.00 0 0 1 128.00 48.00L128.00 75.01A52.99 52.99 0 0 0 75.01 128.00Z" },
];

// Why: the color wheel on the fan's dark card is our own drawing (the four game colors), so the icon library has no equal.
export const CardWheelIcon = () => (
  <svg viewBox="0 0 256 256" aria-hidden="true">
    <g>
      {WHEEL.map((slice) => (
        <path key={slice.fill} fill={slice.fill} d={slice.d} />
      ))}
    </g>
  </svg>
);
