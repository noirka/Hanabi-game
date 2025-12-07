import type { GameEngine } from "../game/engine";
import type { Player, Color } from "../game/types";

export function GameControls({ engine, player }: { engine: GameEngine; player: Player }) {

  const onPlay = (index: number) => {
    engine.performMove({ type: "play", playerId: player.id, cardIndex: index });
  };

  const onDiscard = (index: number) => {
    engine.performMove({ type: "discard", playerId: player.id, cardIndex: index });
  };

  const onHintColor = (targetId: string, color: Color) => {
    engine.performMove({
      type: "hint",
      playerId: player.id,
      targetId,
      hint: { color }
    });
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>

        <button onClick={() => onPlay(0)}>Play</button>
        <button onClick={() => onDiscard(0)}>Discard</button>

        {/* HINT buttons (disabled for self) */}
        {engine.players.map((p) => {
          if (p.id === player.id) return null; 

          return (
            <div key={p.id} style={{ display: "flex", gap: 4 }}>
              {(["red", "blue", "green", "yellow", "white"] as Color[]).map((c) => (
                <button
                  key={c}
                  onClick={() => onHintColor(p.id, c)}
                  style={{
                    border: "1px solid #888",
                    padding: "2px 6px",
                    borderRadius: 4,
                    textTransform: "capitalize",
                    background: c,
                    color: "black",
                    fontWeight: 600
                  }}
                >
                  {c} → {p.name}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
