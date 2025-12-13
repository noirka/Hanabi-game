export const ALL_COLORS = ["red", "blue", "green", "yellow", "white"] as const;
export type Color = typeof ALL_COLORS[number];
export type PlaceholderColor = Color | 'placeholder'; 
export type Rank = 1 | 2 | 3 | 4 | 5;
export type PlaceholderRank = Rank | 0; 

export interface Card {
    id: string;
    color: Color; 
    rank: Rank;   
}

export interface KnownInfo {
    color?: Color;
    rank?: Rank;
}

export interface Player {
    id: string;
    name: string;
    isBot: boolean;
    hand: Card[];
    knownInfo: KnownInfo[];
}

export type Move =
    | { type: "play"; playerId: string; cardIndex: number } 
    | { type: "discard"; playerId: string; cardIndex: number } 
    | {
          type: "hint";
          playerId: string;
          targetId: string;
          hint: { color?: Color; rank?: Rank };
          cardIndex?: number;
      } 
    | { type: "restart"; playerId: string; cardIndex?: number };

export type Fireworks = Record<Color, number>;

export interface GameSnapshot {
    players: Player[];
    discard: Card[];
    fireworks: Fireworks;
    deckCount: number;
    hints: number;
    strikes: number;
    turn: number;
    currentPlayerIndex: number;
    finished: boolean;
    logLines: string[];
}