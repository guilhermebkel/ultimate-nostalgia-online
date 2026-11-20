import type { GameStatus } from "@/Protocols/SiteProtocol";

type GameCardStatusProps = { status: GameStatus; label: string };

export const GameCardStatus = ({ status, label }: GameCardStatusProps) => (
  <span className="status" data-status={status}>
    <i />
    <span>{label}</span>
  </span>
);
