import { useEffect, useState } from "react";
import { GameEngine } from "./game/engine";
import { GameView } from "./ui/GameView";
import type { GameSnapshot, Move } from "./game/types";

const engine = new GameEngine();

function App() {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);

  useEffect(() => {
    const unsubscribe = engine.onChange(() => {
      setSnapshot(engine.snapshot());
    });

    return unsubscribe;
  }, []);

  const sendMove = (move: Move) => {
    engine.performMove(move);
  };

  return (
    <div style={{ padding: 20 }}>
      {snapshot ? (
        <GameView
          snapshot={snapshot}
          sendMove={sendMove}
        />
      ) : (
        "Loading game..."
      )}
    </div>
  );
}

export default App;
