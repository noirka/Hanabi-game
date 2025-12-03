import React from "react";
import type { Move, Player } from "../game/types";

export function GameControls({
  players,
  currentPlayer,
  sendMove,
}: {
  players: Player[];
  currentPlayer: Player;
  sendMove: (m: Move) => void;
}) {
  return (
    <div className="game-controls">
      <p>Current: {currentPlayer?.name}</p>
      {/* приклади кнопок — UI викликає sendMove */}
      <button onClick={() => {
        sendMove({ type: "discard", playerId: currentPlayer.id, cardIndex: 0 });
      }}>Discard 0</button>
    </div>
  );
}
