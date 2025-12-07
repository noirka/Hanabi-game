import React from "react";
import type { GameEngine } from "../game/engine";
import { HandView } from "./HandView";
import { GameControls } from "./GameControls";
import { FireworksView } from "./FireworksView";
import { DiscardPile } from "./DiscardPile";
import { GameLog } from "./GameLog";

export default function GameView({ engine }: { engine: GameEngine }) {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const unsub = engine.onChange(() => setTick((t) => t + 1));
    return unsub;
  }, [engine]);

  const snapshot = engine.snapshot();
  const current = snapshot.players[snapshot.currentPlayerIndex];

  const isFinished = snapshot.finished;

  return (
    <div style={{ padding: 12 }}>
      <h2>Hanabi</h2>

      {isFinished && (
        <div
          style={{
            background: "#800",
            padding: "8px",
            borderRadius: 6,
            color: "white",
            fontWeight: 700,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          GAME OVER — Final Score:{" "}
          {Object.values(snapshot.fireworks).reduce((a, b) => a + b, 0)}
        </div>
      )}

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
            <div
              key={p.id}
             style={{
              marginBottom: 16,
              padding: 8,
              background: "#1f1f1f",
              borderRadius: 6,
              border: p.id === current.id ? "2px solid #ffcf00" : "2px solid transparent",
              boxShadow: p.id === current.id ? "0 0 8px #ffcf00aa" : "none",
            }}

            >
              <HandView
                player={p}
                isMe={p.id === current.id}
                onPlay={
                  !isFinished
                    ? (i) =>
                        engine.performMove({
                          type: "play",
                          playerId: p.id,
                          cardIndex: i,
                        })
                    : undefined
                }
                onDiscard={
                  !isFinished
                    ? (i) =>
                        engine.performMove({
                          type: "discard",
                          playerId: p.id,
                          cardIndex: i,
                        })
                    : undefined
                }
              />

              {p.id === current.id && !isFinished && (
                <GameControls engine={engine} player={p} />
              )}
            </div>
          ))}
        </div>

        <aside style={{ width: 300 }}>
          <DiscardPile discard={snapshot.discard} />

          <div style={{ marginTop: 16 }}>
            <GameLog lines={engine.getLog()} />
          </div>
        </aside>
      </section>
    </div>
  );
}
