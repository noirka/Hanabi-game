import { useState } from "react";
import GameView from "./ui/GameView";
import { GameEngine } from "./game/engine";

export default function App() {
  const [engine] = useState(() => {
    const eng = new GameEngine();
    eng.setup([
      { id: "p1", name: "Player", hand: [], knownInfo: [] },
      { id: "b1", name: "Bot", isBot: true, hand: [], knownInfo: [] },
    ]);
    return eng;
  });

  return <GameView engine={engine} />;
}
