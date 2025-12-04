import React from "react";
import type { GameEngine } from "../game/engine";
import { HandView } from "./HandView";
import { GameControls } from "./GameControls";
import { FireworksView } from "./FireworksView";
import { DiscardPile } from "./DiscardPile";

export function GameView({ engine }: { engine: GameEngine }) {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const unsub = engine.onChange(() => setTick((t) => t + 1));
    return unsub;
  }, [engine]);

  const snapshot = engine.snapshot();
  const current = snapshot.players[snapshot.currentPlayerIndex];

  return (
    <div style={{ padding: "16px" }}>
      <h2>Hanabi — Local Demo</h2>

      <p>
        <b>Turn:</b> {snapshot.turn}
        {" | "}
        <b>Hints:</b> {snapshot.hints}
        {" | "}
        <b>Strikes:</b> {snapshot.strikes}
        {" | "}
        <b>Deck:</b> {snapshot.deckCount}
      </p>

      <FireworksView fireworks={snapshot.fireworks} />

      <DiscardPile discard={snapshot.discard} />

      <hr />

      {snapshot.players.map((p) => (
        <div key={p.id} style={{ marginBottom: "28px" }}>
          <h3>
            {p.name}
            {p.id === current.id ? "  ← current" : ""}
          </h3>

          <HandView player={p} />

          {p.id === current.id && (
            <GameControls engine={engine} player={p} />
          )}
        </div>
      ))}
    </div>
  );
}
