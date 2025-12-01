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

  setup(players: Player[]) {
  this.players = players;
  this.deck = generateDeck();
  this.discard = [];
  this.hints = 8;
  this.strikes = 0;
  this.turn = 1;
  this.currentPlayerIndex = 0;
  this.finished = false;

  this.logLines = ["Game started"];

  this.dealHands();

  this.emitChange();
   }

  listeners: Array<() => void> = [];

   onChange(cb: () => void) {
   this.listeners.push(cb);
   return () => {
      this.listeners = this.listeners.filter((f) => f !== cb);
   };
   }

   private emitChange() {
   for (const cb of this.listeners) cb();
   }

   logLines: string[] = [];

   log(msg: string) {
   const line = `[Turn ${this.turn}] ${msg}`;
   this.logLines.push(line);
   console.log(line);
   }

   getLog() {
   return this.logLines;
   }

   private initialHandSize(playerCount: number): number {
   return playerCount <= 3 ? 5 : 4;
   }

   private dealHands() {
   const handSize = this.initialHandSize(this.players.length);

   for (const player of this.players) {
      player.hand = [];
      player.knownInfo = [];

      for (let i = 0; i < handSize; i++) {
         const card = this.deck.pop();
         if (!card) throw new Error("Deck ended during deal!");
         player.hand.push(card);
         player.knownInfo.push({});
      }
   }
   }
}
