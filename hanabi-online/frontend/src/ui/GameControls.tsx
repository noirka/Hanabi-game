import type { GameEngine } from "../game/engine";
import type { Player, Color } from "../game/types";

export function GameControls({ engine, player }: { engine: GameEngine; player: Player }) {

  const play = (i: number) =>
    engine.performMove({ type: "play", playerId: player.id, cardIndex: i });

  const discard = (i: number) =>
    engine.performMove({ type: "discard", playerId: player.id, cardIndex: i });

  const hintColor = (targetId: string, color: Color) =>
    engine.performMove({
      type: "hint",
      playerId: player.id,
      targetId,
      hint: { color }
    });

  const opponents = engine.players.filter(p => p.id !== player.id);

  return (
    <div style={{
      marginTop: 8,
      padding: 8,
      background: "#242424",
      borderRadius: 6
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

        <div style={{ display: "flex", gap: 6 }}>
          <button style={btn} onClick={() => play(0)}>🎆 Play</button>
          <button style={btnDanger} onClick={() => discard(0)}>🗑 Discard</button>
        </div>

        <div style={{ fontSize: 11, opacity: 0.7 }}>
          Give hint to:
        </div>

        {opponents.map((p) => (
          <div key={p.id} style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {(["red", "blue", "green", "yellow", "white"] as Color[]).map((c) => (
              <button
                key={c}
                onClick={() => hintColor(p.id, c)}
                style={{
                  ...btnSmall,
                  background: c,
                  color: c === "yellow" ? "#222" : "white"
                }}
              >
                {c}
              </button>
            ))}
            <div style={{ fontSize: 12, color: "#aaa" }}>→ {p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "6px 10px",
  background: "#444",
  border: "1px solid #666",
  borderRadius: 4,
  cursor: "pointer",
  fontWeight: 600,
};

const btnDanger: React.CSSProperties = {
  ...btn,
  background: "#661a1a",
  border: "1px solid #aa0000"
};

const btnSmall: React.CSSProperties = {
  padding: "3px 6px",
  borderRadius: 4,
  cursor: "pointer",
  border: "none",
  fontWeight: 700,
  fontSize: 11
};
