import React from "react";
import type { Player } from "../game/types";
import { CardView } from "./CardView";

export function HandView({
  player,
  isMe,
  onPlay,
  onDiscard,
}: {
  player: Player;
  isMe?: boolean;
  onPlay?: (index: number) => void;
  onDiscard?: (index: number) => void;
}) {
  return (
    <div className="hand">
      <h4>{player.name} {player.isBot ? "(bot)" : ""}</h4>
      <div className="cards">
        {player.hand.map((c, i) => (
          <div key={c.id} className="hand-slot">
            {isMe ? (
              <>
                <div className="known-info">
                  <span>{player.knownInfo[i]?.color ?? "?"}</span>
                  <span>{player.knownInfo[i]?.rank ?? "?"}</span>
                </div>
                <CardView card={c} />
                <div className="actions">
                  <button onClick={() => onPlay && onPlay(i)}>Play</button>
                  <button onClick={() => onDiscard && onDiscard(i)}>Discard</button>
                </div>
              </>
            ) : (
              <CardView card={c} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
