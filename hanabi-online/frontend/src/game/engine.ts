import type { Player, GameSnapshot, Move, Color, Rank, Card } from "./types";
import { generateDeck } from "./deck";
import { deepClone } from "../utils/helpers";

export class GameEngine {
  players: Player[] = [];
  deck = generateDeck();
  discard: Card[] = [];
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

  listeners: Array<() => void> = [];
  logLines: string[] = [];

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

  private validateMove(move: Move) {
    const player = this.players[this.currentPlayerIndex];

    if (!player) {
      throw new Error("No current player");
    }
    if (move.playerId !== player.id) {
      throw new Error("It's not this player's turn");
    }
  }

  private canPlay(card: { color: Color; rank: Rank }): boolean {
  const top = this.fireworks[card.color];
  return card.rank === top + 1;
}

private drawCardInto(player: Player, index: number) {
  const newCard = this.deck.pop();
  if (!newCard) {
    player.hand.splice(index, 1);
    player.knownInfo.splice(index, 1);
    return;
  }

  player.hand[index] = newCard;
  player.knownInfo[index] = {};
}

private advanceTurn() {
  this.currentPlayerIndex =
    (this.currentPlayerIndex + 1) % this.players.length;
  this.turn++;
}

  performMove(move: Move): void {
    this.validateMove(move);
  if (move.type === "play") {
    const player = this.players[this.currentPlayerIndex];

    const card = player.hand[move.cardIndex];
    if (!card) throw new Error("Invalid card index");

    if (this.canPlay(card)) {
      this.fireworks[card.color] += 1;
      this.log(`${player.name} successfully played ${card.color} ${card.rank}`);

      if (card.rank === 5 && this.hints < 8) {
        this.hints += 1;
        this.log(`Completed a 5 — gained a hint.`);
      }
    } else {
      this.discard.push(card);
      this.strikes += 1;
      this.log(`${player.name} failed play ${card.color} ${card.rank} — strike ${this.strikes}`);

      if (this.strikes >= 3) {
        this.finished = true;
        this.log("Game over — too many strikes");
      }
    }

    player.hand.splice(move.cardIndex, 1);
    player.knownInfo.splice(move.cardIndex, 1);

    this.drawCardInto(player, move.cardIndex);

    this.advanceTurn();
    this.emitChange();
    return;
  }
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

  onChange(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((f) => f !== cb);
    };
  }

  private emitChange() {
    for (const cb of this.listeners) cb();
  }

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
