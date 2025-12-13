import { decideMove } from '../bot';
import { GameSnapshot, Card, KnownInfo, Move, Color, Rank } from '../types';
import { GameEngine } from '../engine'; 

class MockGameEngine extends GameEngine {
    private mockSnapshot: GameSnapshot;
    constructor(snapshot: GameSnapshot) {
        super(); 
        this.mockSnapshot = snapshot;
    }

    public snapshot(): GameSnapshot {
        return this.mockSnapshot;
    }
}

describe('Bot Logic Testing (Priorities)', () => {

    const createMockGameSnapshot = (
        fireworks: Record<Color, number>, 
        botHand: Card[],
        knownInfo: KnownInfo[]
    ): GameSnapshot => ({
        players: [
            { id: 'bot-1', name: 'Bot', isBot: true, hand: botHand, knownInfo: knownInfo },
            { id: 'player-2', name: 'Player 2', isBot: false, hand: [], knownInfo: [] },
        ],
        discard: [],
        fireworks,
        deckCount: 40,
        hints: 8,
        strikes: 0,
        turn: 1,
        currentPlayerIndex: 0, 
        finished: false,
        logLines: [],
    });

    test('P1: Bot should play a card when it is 100% certain it is the next playable card', () => {
        const cardToPlay: Card = { id: 'r1', color: 'red', rank: 1 };
        
        const botHand: Card[] = [
            cardToPlay, 
            { id: 'b3', color: 'blue', rank: 3, },
            { id: 'y2', color: 'yellow', rank: 2 },
        ];
        
        const fireworks: Record<Color, number> = { 
            red: 0, 
            blue: 0, 
            green: 0, 
            yellow: 0, 
            white: 0 
        } as Record<Color, number>; 
        const knownInfo: KnownInfo[] = [
            { color: 'red', rank: 1 }, 
            {},
            {},
        ];
        
        const snapshot = createMockGameSnapshot(fireworks, botHand, knownInfo);
        const mockEngine = new MockGameEngine(snapshot); 
        
        const botPlayer = snapshot.players[0]; 

        const move: Move = decideMove(mockEngine, botPlayer);

        expect(move.type).toBe("play");
        expect(move.cardIndex).toBe(0);
        expect(move.playerId).toBe(botPlayer.id);
    });
});