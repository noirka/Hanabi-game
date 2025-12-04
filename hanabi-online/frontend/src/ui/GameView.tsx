import React from "react";
import type { GameEngine } from "../game/engine";
import { HandView } from "./HandView";
import { GameControls } from "./GameControls";
import type { GameSnapshot, Move } from "../game/types";


export function GameView({ engine }: { engine: GameEngine }) {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const unsub = engine.onChange(() => setTick((t) => t + 1));
    return unsub;
  }, [engine]);

   const snapshot = engine.snapshot();
  const current = snapshot.players[snapshot.currentPlayerIndex];

  return (
  <div style={{ padding: "12px" }}>
    <h2>Hanabi Online</h2>

    <p>
      <b>Turn:</b> {engine.turn}
      {" | "}
      <b>Hints:</b> {engine.hints}
      {" | "}
      <b>Strikes:</b> {engine.strikes}
      {" | "}
      <b>Deck:</b> {engine.deck.length}
    </p>

    <hr />

    {engine.players.map((p) => (
      <div key={p.id} style={{ marginBottom: "20px" }}>
        <h3>
          {p.name}
          {engine.players[engine.currentPlayerIndex].id === p.id
            ? " ← current"
            : ""}
        </h3>

        <HandView player={p} />

        {engine.players[engine.currentPlayerIndex].id === p.id && (
          <GameControls engine={engine} player={p} />
        )}
      </div>
    ))}
  </div>
);

}
