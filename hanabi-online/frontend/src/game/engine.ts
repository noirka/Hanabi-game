import type { Player, GameSnapshot, Move } from "./types";
import { generateDeck } from "./deck";
import { deepClone } from "../utils/helpers";

export class GameEngine {
  players: Player[] = [];
  deck = generateDeck();
  discard = [];
  fireworks = {
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0,
    white: 0,
  };

  hints = 8;
  strikes = 0;
  turn = 1;
  currentPlayerIndex = 0;
  finished = false;

  constructor() {}

  snapshot(): GameSnapshot {
    return {
      players: deepClone(this.players),
      discard: deepClone(this.discard),
      fireworks: deepClone(this.fireworks),
      deckCount: this.deck.length,
      hints: this.hints,
      strikes: this.strikes,
      turn: this.turn,
      currentPlayerIndex: this.currentPlayerIndex,
      finished: this.finished,
    };
  }

  performMove(_move: Move) {
    throw new Error("performMove() not implemented yet");
  }

  setup(_players: Player[]) {
    this.players = _players;
  }
}
