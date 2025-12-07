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
    const unsub = engine.onChange(() => setTick(i => i + 1));
    return unsub;
  }, [engine]);

  const snapshot = engine.snapshot();
  const current = snapshot.players[snapshot.currentPlayerIndex];
  const isFinished = snapshot.finished;

  const restartGame = () => {
    engine.setup(JSON.parse(JSON.stringify(engine.players)));
  };

  return (
    <div style={{ padding: 12, color: "white" }}>
      <h2 style={{ marginBottom: 10 }}>Hanabi — Online</h2>

      <button
        onClick={restartGame}
        style={{
          padding: "6px 10px",
          marginBottom: 12,
          borderRadius: 6,
          background: "#444",
          border: "1px solid #666",
          color: "white",
          cursor: "pointer"
        }}
      >
        🔁 Restart Game
      </button>

      {isFinished && (
        <div
          style={{
            background: "#6c0000",
            padding: "8px",
            borderRadius: 6,
            marginBottom: 12,
            textAlign: "center",
            color: "white",
            fontWeight: 700
          }}
        >
          GAME OVER — Final Score:{" "}
          {Object.values(snapshot.fireworks).reduce((a, b) => a + b, 0)}
        </div>
      )}

      <p style={{ marginBottom: 10 }}>
        <b>Turn:</b> {snapshot.turn}{" | "}
        <b>Hints:</b> {snapshot.hints}{" | "}
        <b>Strikes:</b> {snapshot.strikes}{" | "}
        <b>Deck:</b> {snapshot.deckCount}
      </p>

      <FireworksView fireworks={snapshot.fireworks} />

      <section style={{ display: "flex", gap: 16, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          {snapshot.players.map(p => (
            <div
              key={p.id}
              style={{
                marginBottom: 16,
                padding: 8,
                background: "#1b1b1b",
                borderRadius: 6,
                border:
                  p.id === current.id
                    ? "2px solid #ffcf00"
                    : "2px solid transparent",
                boxShadow:
                  p.id === current.id ? "0 0 10px #ffcf0044" : "none"
              }}
            >
              <HandView
                player={p}
                isMe={p.id === current.id}
                onPlay={!isFinished ? i => engine.performMove({
                  type: "play", playerId: p.id, cardIndex: i
                }) : undefined}
                onDiscard={!isFinished ? i => engine.performMove({
                  type: "discard", playerId: p.id, cardIndex: i
                }) : undefined}
              />

              {p.id === current.id && !isFinished && (
                <GameControls engine={engine} player={p} />
              )}
            </div>
          ))}
        </div>

        <aside style={{ width: 320 }}>
          <DiscardPile discard={snapshot.discard} />
          <div style={{ marginTop: 16 }}>
            <GameLog lines={engine.getLog()} />
          </div>
        </aside>
      </section>
    </div>
  );
}
