import { useState, useEffect } from "react";
import GameView from "./ui/GameView";
import { GameEngine } from "./game/engine";

export default function App() {
  const [engine, setEngine] = useState<GameEngine | null>(null);

  useEffect(() => {

    setTimeout(() => {
      const eng = new GameEngine();
      eng.setup([
        { id: "p1", name: "Player", hand: [], knownInfo: [] },
        { id: "b1", name: "Bot", isBot: true, hand: [], knownInfo: [] }
      ]);
      setEngine(eng);
    }, 0);

  }, []);

  if (!engine) return <>Loading game...</>;

  return <GameView engine={engine} />;
}
