import type { Card, Color, Rank } from "./types";
import { uid, shuffle } from "../utils/helpers";

export const COLORS: Color[] = ["red", "blue", "green", "yellow", "white"];

const RANK_COUNTS: Record<Rank, number> = {
  1: 3,
  2: 2,
  3: 2,
  4: 2,
  5: 1,
};

const RANKS: Rank[] = [1, 2, 3, 4, 5];

export function generateDeck(): Card[] {
  const deck: Card[] = [];

  for (const color of COLORS) {
    for (const rank of RANKS) {
      const count = RANK_COUNTS[rank];
      for (let i = 0; i < count; i++) {
        deck.push({
          id: uid("card_"),
          color,
          rank,
        });
      }
    }
  }

  return shuffle(deck);
}
