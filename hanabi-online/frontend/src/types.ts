export type Color = 'red' | 'blue' | 'green' | 'yellow' | 'white';
export type Rank = 1 | 2 | 3 | 4 | 5;

export type PlaceholderColor = Color | 'placeholder'; 
export type PlaceholderRank = Rank | 0; 

export interface Card {
    id: string;
    color: PlaceholderColor; 
    rank: PlaceholderRank; 
}

export interface KnownInfo {
    color?: Color;
    rank?: Rank;
    notColor?: Partial<Record<Color, boolean>>;
    notRank?: Partial<Record<Rank, boolean>>;
}

export interface PlayerSetupData {
    id: string; 
    name: string;
    isBot: boolean;
}

export interface Player extends PlayerSetupData {
    hand: Card[]; 
    knownInfo: KnownInfo[];
}

export interface GameSnapshot { 
    turn: number;
    currentPlayerIndex: number; 
    
    deckCount: number;

    hints: number; 
    strikes: number;
    
    finished: boolean;
    
    fireworks: Record<Color, Rank>; 
    
    discard: Card[]; 
    logLines: string[]; 
    
    players: Player[];
    
}

interface MoveBase {
    type: 'play' | 'discard' | 'hint' | 'restart';
    playerId?: string; 
}

export interface PlayDiscardMove extends MoveBase {
    type: 'play' | 'discard';
    cardIndex: number;
}

export interface HintValue {
    color?: Color;
    rank?: Rank;
}

export interface HintMove extends MoveBase {
    type: 'hint';
    targetId: string; 
    hint: HintValue;
}

export interface RestartMove extends MoveBase {
    type: 'restart';
}

export type Move = PlayDiscardMove | HintMove | RestartMove;

export type GameMove = Move;
