export type Color = "red" | "blue" | "green" | "yellow" | "white";

export type Rank = 1 | 2 | 3 | 4 | 5;

export interface Card {
  id: string;     
  color: Color;
  rank: Rank;
}

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  hand: Card[];

  knownInfo: Array<{
    color?: Color;
    rank?: Rank;
  }>;
}

export type Move =
  | { type: "play"; playerId: string; cardIndex: number }
  | { type: "discard"; playerId: string; cardIndex: number }
  | {
      type: "hint";
      playerId: string;      
      targetId: string;      
      hint: { color?: Color; rank?: Rank };
    };

export interface GameSnapshot {
  players: Player[];
  discard: Card[];
  fireworks: Record<Color, number>;

  deckCount: number;
  hints: number;
  strikes: number;

  turn: number;
  currentPlayerIndex: number;
  finished: boolean;
}
