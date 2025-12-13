import type { Card, Rank } from "./types";
import { ALL_COLORS } from "./types";
import { uid, shuffle } from "../utils/helpers";

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

    for (const color of ALL_COLORS) {
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