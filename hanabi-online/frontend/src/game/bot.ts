import type { GameSnapshot, Player, Move, Card } from "./types";
import type { GameEngine } from "./engine";

function isCardPlayableFromSnapshot(snapshot: GameSnapshot, card: Card): boolean {
  const top = snapshot.fireworks[card.color] ?? 0;
  return card.rank === (top + 1);
}

export function decideMove(engine: GameEngine, player: Player): Move {
  const snapshot: GameSnapshot = engine.snapshot();

  for (let i = 0; i < player.hand.length; i++) {
    const info = player.knownInfo[i];
    const card = player.hand[i];
    if (info && info.color && info.rank) {
      if (isCardPlayableFromSnapshot(snapshot, card)) {
        return { type: "play", playerId: player.id, cardIndex: i };
      }
    }
  }

  if (snapshot.hints > 0) {
    for (const target of snapshot.players) {
      if (target.id === player.id) continue;
      for (let i = 0; i < target.hand.length; i++) {
        const c = target.hand[i];
        if (isCardPlayableFromSnapshot(snapshot, c)) {
          return { type: "hint", playerId: player.id, targetId: target.id, hint: { color: c.color } };
        }
      }
    }
  }

  return { type: "discard", playerId: player.id, cardIndex: 0 };
}
