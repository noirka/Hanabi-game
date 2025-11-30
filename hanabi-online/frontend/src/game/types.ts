export type Color = "red" | "blue" | "green" | "yellow" | "white";

export type Rank = 1 | 2 | 3 | 4 | 5;

export interface Card {
  id: string;     
  color: Color;
  rank: Rank;
}
