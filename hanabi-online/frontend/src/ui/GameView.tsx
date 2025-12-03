import React from "react";
import type { GameSnapshot } from "../game/types";
import type { GameEngine } from "../game/engine";
import { HandView } from "./HandView";
import { GameControls } from "./GameControls";

export function GameView({ engine }: { engine: GameEngine }) {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const unsub = engine.onChange(() => setTick((t) => t + 1));
    return unsub;
  }, [engine]);

  const snap = engine.snapshot();
  const players = snap.players;
  const currentPlayer = players[snap.currentPlayerIndex];

  const sendMove = (m: any) => {
    try {
      engine.performMove(m);
    } catch (err) {
      console.error("performMove error", err);
    }
  };

  return (
    <div className="game-board">
      <div className="left">
        <h3>Info</h3>
        <p>Hints: {snap.hints}</p>
        <p>Strikes: {snap.strikes}</p>
        <p>Deck: {snap.deckCount}</p>
      </div>

      <div className="center">
        <h2>Players</h2>
        {players.map((p) => (
          <div key={p.id} className={p.id === currentPlayer?.id ? "player active" : "player"}>
            <HandView
              player={p as any}
              isMe={p.id === currentPlayer?.id}
              onPlay={(i) => sendMove({ type: "play", playerId: p.id, cardIndex: i })}
              onDiscard={(i) => sendMove({ type: "discard", playerId: p.id, cardIndex: i })}
            />
          </div>
        ))}
      </div>

      <div className="right">
        <GameControls players={players as any} currentPlayer={currentPlayer as any} sendMove={sendMove} />
      </div>
    </div>
  );
}
