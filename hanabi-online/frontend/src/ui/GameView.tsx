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

    {/* Fireworks */}
<div style={{ marginBottom: "12px" }}>
  <h3>Fireworks</h3>
  <div style={{ display: "flex", gap: "8px" }}>
    {Object.entries(engine.fireworks).map(([color, value]) => (
      <div
        key={color}
        style={{
          padding: "6px 10px",
          background: "#333",
          borderRadius: "4px",
        }}
      >
        {color}: {value}
      </div>
    ))}
  </div>
</div>

  <div style={{ marginBottom: "12px" }}>
    <h3>Discard pile</h3>

    {engine.discard.length === 0 && <p>No cards discarded yet.</p>}

    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {engine.discard.map((c) => (
        <div
          key={c.id}
          style={{
            padding: "4px 8px",
            border: "1px solid #444",
            borderRadius: "4px",
            fontSize: "14px",
            background: "#222",
          }}
        >
          {c.color} {c.rank}
        </div>
      ))}
    </div>
  </div>

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
