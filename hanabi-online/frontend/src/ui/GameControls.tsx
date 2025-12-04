import React from "react";
import type { GameEngine } from "../game/engine";
import type { Player } from "../game/types";

export function GameControls({
  engine,
  player,
}: {
  engine: GameEngine;
  player: Player;
}) {
  return (
    <div style={{ marginTop: "8px" }}>
      <button onClick={() => {
        engine.performMove({
          type: "play",
          playerId: player.id,
          cardIndex: 0,
        });
      }}>
        Play card 0
      </button>

      <button onClick={() => {
        engine.performMove({
          type: "discard",
          playerId: player.id,
          cardIndex: 0,
        });
      }}>
        Discard card 0
      </button>
    </div>
  );
}
