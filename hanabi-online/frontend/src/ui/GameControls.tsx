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
    engine.performMove({ type: "hint", playerId: player.id, targetId, hint: { color } });
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onPlay(0)}>Play slot 0</button>
        <button onClick={() => onDiscard(0)}>Discard slot 0</button>
        {/* Simple quick hint UI for demo: hint color 'red' to next player */}
        <button onClick={() => {
          const next = engine.players[(engine.currentPlayerIndex + 1) % engine.players.length];
          onHintColor(next.id, "red" as Color);
        }}>Hint red to next</button>
      </div>
    </div>
  );
}
