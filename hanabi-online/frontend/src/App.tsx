import React from "react";
import "./App.css";
import { GameView } from "./ui/GameView";
import { newGameWithBots } from "./game/engine";
import type { GameEngine } from "./game/engine";

export default function App() {
  const [engine] = React.useState<GameEngine>(() => newGameWithBots({ players: 3, includeBots: true }));

  return (
    <div className="app">
      <header>
        <h1>Hanabi</h1>
      </header>

      <main>
        <GameView engine={engine} />
      </main>
    </div>
  );
}
