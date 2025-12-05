import React from "react"; 
import type { GameEngine } from "../game/engine";
import { HandView } from "./HandView";
import { GameControls } from "./GameControls";
import { FireworksView } from './FireworksView'; 
import { DiscardPile } from './DiscardPile';

export default function GameView({ engine }: { engine: GameEngine }) {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const unsub = engine.onChange(() => setTick((t) => t + 1));
    return unsub;
  }, [engine]);

  const snapshot = engine.snapshot();
  const current = snapshot.players[snapshot.currentPlayerIndex];

  return (
    <div style={{ padding: 12 }}>
      <h2>Hanabi</h2>

      <p>
        <b>Turn:</b> {snapshot.turn}{" | "}
        <b>Hints:</b> {snapshot.hints}{" | "}
        <b>Strikes:</b> {snapshot.strikes}{" | "}
        <b>Deck:</b> {snapshot.deckCount}
      </p>

      <section style={{ margin: "12px 0" }}>
        <FireworksView fireworks={snapshot.fireworks} />
      </section>

      <section style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          {snapshot.players.map((p) => (
            <div key={p.id} style={{ marginBottom: 16, padding: 8, background: "#1f1f1f", borderRadius: 6 }}>
              <HandView
                player={p}
                isMe={p.id === current.id} 
                onPlay={(i) => engine.performMove({ type: "play", playerId: p.id, cardIndex: i })}
                onDiscard={(i) => engine.performMove({ type: "discard", playerId: p.id, cardIndex: i })}
              />
              {p.id === current.id && (
                <GameControls engine={engine} player={p} /> 
              )}
            </div>
          ))}
        </div>

        <aside style={{ width: 300 }}>
          <DiscardPile discard={snapshot.discard} />
        </aside>
      </section>
    </div>
  );
}
