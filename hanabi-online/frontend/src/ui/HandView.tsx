import React from "react";
import { CardView } from "./CardView";
import type { Player } from "../game/types";

export function HandView({
  player,
  isCurrent,
  onPlay,
  onDiscard,
}: {
  player: Player;
  isCurrent: boolean;
  onPlay: (index: number) => void;
  onDiscard: (index: number) => void;
}) {
  return (
    <div className="hand-view">
      <h3>
        {player.name} {isCurrent ? "(Your turn)" : ""}
      </h3>

      <div className="hand-cards">
        {player.hand.map((card, idx) => (
          <div key={card.id} className="card-entry">
            <CardView card={card} />

            {isCurrent && (
              <div className="actions">
                <button onClick={() => onPlay(idx)}>Play</button>
                <button onClick={() => onDiscard(idx)}>Discard</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
