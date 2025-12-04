import type { Player } from "../game/types";
import { CardView } from "./CardView";

export function HandView({
  player,
  isMe,
  onPlay,
  onDiscard
}: {
  player: Player;
  isMe?: boolean;
  onPlay?: (i: number) => void;
  onDiscard?: (i: number) => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: 6, fontWeight: 700 }}>{player.name} {player.isBot ? "(bot)" : ""}</div>
      <div style={{ display: "flex", gap: 8 }}>
        {player.hand.map((c, i) => (
          <div key={c.id} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            <CardView card={isMe ? { ...c } : c} hidden={!isMe ? false : false /* you can hide own cards visually if desired */} />
            {isMe && (
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => onPlay && onPlay(i)}>Play</button>
                <button onClick={() => onDiscard && onDiscard(i)}>Discard</button>
              </div>
            )}
            {isMe && (
              <div style={{ fontSize: 11 }}>
                <div>Known: color: {player.knownInfo[i]?.color ?? "?"} rank: {player.knownInfo[i]?.rank ?? "?"}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
