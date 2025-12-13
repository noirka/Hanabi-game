import { decideMove } from '../bot';
import { GameSnapshot, Card, KnownInfo, Move, Color, Rank, Player } from '../types';
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
        players: Player[]
    ): GameSnapshot => ({
        players: players,
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
        const botId = 'bot-1';
        
        const cardToPlay: Card = { id: 'r1', color: 'red', rank: 1 };
        
        const botHand: Card[] = [
            cardToPlay, 
            { id: 'b3', color: 'blue', rank: 3 },
            { id: 'y2', color: 'yellow', rank: 2 },
        ];
        
        const fireworks: Record<Color, number> = { 
            red: 0, blue: 0, green: 0, yellow: 0, white: 0 
        } as Record<Color, number>;

        const knownInfo: KnownInfo[] = [
            { color: 'red', rank: 1 }, 
            {},
            {},
        ];
        
        const players: Player[] = [
            { id: botId, name: 'Bot', isBot: true, hand: botHand, knownInfo: knownInfo },
            { id: 'player-2', name: 'Player 2', isBot: false, hand: [], knownInfo: [] },
        ];

        const snapshot = createMockGameSnapshot(fireworks, players);
        const mockEngine = new MockGameEngine(snapshot);
        const botPlayer = snapshot.players[0]; 

        const move: Move = decideMove(mockEngine, botPlayer);

        expect(move.type).toBe("play");
        expect(move.cardIndex).toBe(0);
        expect(move.playerId).toBe(botId);
    });
    
    test('P1.1: Bot should play card if color is known and it must be Rank 5', () => {
        const botId = 'bot-1';
        
        const cardToPlay: Card = { id: 'r5', color: 'red', rank: 5 };
        
        const botHand: Card[] = [
            cardToPlay, 
            { id: 'b3', color: 'blue', rank: 3 },
        ];
        
        const fireworks: Record<Color, number> = { 
            red: 4, blue: 0, green: 0, yellow: 0, white: 0 
        } as Record<Color, number>;

        const knownInfo: KnownInfo[] = [
            { color: 'red', rank: undefined }, 
            {},
        ];
        
        const players: Player[] = [
            { id: botId, name: 'Bot', isBot: true, hand: botHand, knownInfo: knownInfo },
        ];

        const snapshot = createMockGameSnapshot(fireworks, players);
        const mockEngine = new MockGameEngine(snapshot);
        const botPlayer = snapshot.players[0]; 

        const move: Move = decideMove(mockEngine, botPlayer);

        expect(move.type).toBe("play");
        expect(move.cardIndex).toBe(0);
        expect(move.playerId).toBe(botId);
    });

    test('P2: Bot should give a HINT when another player holds the next playable card, and bot has no certain play', () => {
        const botId = 'bot-1';
        const targetId = 'player-2';
        
        const targetPlayableCard: Card = { id: 'r1', color: 'red', rank: 1 };
        
        const targetHand: Card[] = [
            targetPlayableCard, 
            { id: 'b3', color: 'blue', rank: 3 },
            { id: 'y2', color: 'yellow', rank: 2 },
        ];
        
        const botHand: Card[] = [
            { id: 'w1', color: 'white', rank: 1 }, 
            { id: 'g3', color: 'green', rank: 3 },
        ];

        const fireworks: Record<Color, number> = { 
            red: 0, blue: 0, green: 0, yellow: 0, white: 0 
        } as Record<Color, number>;

        const botKnownInfo: KnownInfo[] = [{}, {}];
        
        const players: Player[] = [
            { id: botId, name: 'Bot', isBot: true, hand: botHand, knownInfo: botKnownInfo },
            { id: targetId, name: 'Player 2', isBot: false, hand: targetHand, knownInfo: [] },
        ];

        const snapshot: GameSnapshot = createMockGameSnapshot(fireworks, players);
        snapshot.hints = 1; 

        const mockEngine = new MockGameEngine(snapshot);
        const botPlayer = snapshot.players[0]; 

        const move: Move = decideMove(mockEngine, botPlayer);

        expect(move.type).toBe("hint");

        const hintMove = move as { type: "hint"; targetId: string; hint: { color?: Color; rank?: Rank }; playerId: string };

        expect(hintMove.targetId).toBe(targetId);
        expect(hintMove.hint).toEqual({ color: 'red' }); 
        expect(hintMove.playerId).toBe(botId);
    });
    
    test('P2.1: Bot should give HINT if hints count is 8 (to avoid waste) and no play is certain', () => {
        const botId = 'bot-1';
        const targetId = 'player-2';
        
        const targetHand: Card[] = [
            { id: 'r2', color: 'red', rank: 2 }, 
            { id: 'b2', color: 'blue', rank: 2 },
        ];
        
        const botHand: Card[] = [
            { id: 'w1', color: 'white', rank: 1 }, 
            { id: 'g3', color: 'green', rank: 3 },
        ];

        const fireworks: Record<Color, number> = { 
            red: 0, blue: 0, green: 0, yellow: 0, white: 0 
        } as Record<Color, number>;

        const botKnownInfo: KnownInfo[] = [{}, {}];
        
        const players: Player[] = [
            { id: botId, name: 'Bot', isBot: true, hand: botHand, knownInfo: botKnownInfo },
            { id: targetId, name: 'Player 2', isBot: false, hand: targetHand, knownInfo: [] },
        ];

        const snapshot: GameSnapshot = createMockGameSnapshot(fireworks, players);
        snapshot.hints = 8; 

        const mockEngine = new MockGameEngine(snapshot);
        const botPlayer = snapshot.players[0]; 

        const move: Move = decideMove(mockEngine, botPlayer);

        expect(move.type).toBe("hint");
        
        const hintMove = move as { type: "hint"; targetId: string; hint: { color?: Color; rank?: Rank }; playerId: string };
        expect(hintMove.targetId).toBe(targetId);
        expect(hintMove.hint).toEqual({ color: 'red' }); 
    });
    
    test('P3: Bot should DISCARD the first card (Index 0) when no play or hint is possible', () => {
        const botId = 'bot-1';
        const targetId = 'player-2';
        
        const targetHand: Card[] = [
            { id: 'r2', color: 'red', rank: 2 }, 
            { id: 'b2', color: 'blue', rank: 2 },
        ];
        
        const botHand: Card[] = [
            { id: 'w1', color: 'white', rank: 1 }, 
            { id: 'g3', color: 'green', rank: 3 },
        ];

        const fireworks: Record<Color, number> = { 
            red: 0, blue: 0, green: 0, yellow: 0, white: 0 
        } as Record<Color, number>;

        const botKnownInfo: KnownInfo[] = [{}, {}];
        
        const players: Player[] = [
            { id: botId, name: 'Bot', isBot: true, hand: botHand, knownInfo: botKnownInfo },
            { id: targetId, name: 'Player 2', isBot: false, hand: targetHand, knownInfo: [] },
        ];

        const snapshot: GameSnapshot = createMockGameSnapshot(fireworks, players);
        snapshot.hints = 0; 

        const mockEngine = new MockGameEngine(snapshot);
        const botPlayer = snapshot.players[0]; 

        const move: Move = decideMove(mockEngine, botPlayer);

        expect(move.type).toBe("discard");
        expect(move.cardIndex).toBe(0);
        expect(move.playerId).toBe(botId);
    });

    test('P3.1: Bot must NOT discard a card that has known information (must discard unknown card at Index 1)', () => {
        const botId = 'bot-1';
        
        const botHand: Card[] = [
            { id: 'w1', color: 'white', rank: 1 }, 
            { id: 'g3', color: 'green', rank: 3 }, 
        ];

        const fireworks: Record<Color, number> = { 
            red: 0, blue: 0, green: 0, yellow: 0, white: 0 
        } as Record<Color, number>;

        const knownInfo: KnownInfo[] = [
            { color: 'white', rank: undefined }, 
            {}, 
        ];
        
        const players: Player[] = [
            { id: botId, name: 'Bot', isBot: true, hand: botHand, knownInfo: knownInfo },
            { id: 'player-2', name: 'Player 2', isBot: false, hand: [], knownInfo: [] },
        ];

        const snapshot = createMockGameSnapshot(fireworks, players);
        snapshot.hints = 0; 

        const mockEngine = new MockGameEngine(snapshot);
        const botPlayer = snapshot.players[0]; 

        const move: Move = decideMove(mockEngine, botPlayer);

        expect(move.type).toBe("discard"); 
        expect(move.cardIndex).toBe(1); 
        expect(move.playerId).toBe(botId);
    });
});