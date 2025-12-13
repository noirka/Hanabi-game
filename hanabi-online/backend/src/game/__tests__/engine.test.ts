import { GameEngine } from '../engine';
import { GameSnapshot, Color, Rank, Player, Card, Move } from '../types';

describe('Game Engine Logic Testing', () => {
    
    const createPlayer = (id: string, name: string, hand: Card[], knownInfo: any[]): Player => ({
        id,
        name,
        isBot: false,
        hand,
        knownInfo,
    });
    
    test('Play: Should successfully play Rank 1 card and advance the firework', () => {
        const p1Id = 'p1';
        const cardToPlay: Card = { id: 'r1', color: 'red', rank: 1 };
        
        const engine = new GameEngine();
        
        const players: Player[] = [
            createPlayer(p1Id, 'Player 1', [cardToPlay], [{ color: 'red', rank: 1 }]),
            createPlayer('p2', 'Player 2', [{ id: 'b1', color: 'blue', rank: 1 }], [{}])
        ];
        
        engine.players = players;
        engine.fireworks = { red: 0, blue: 0, green: 0, yellow: 0, white: 0 } as Record<Color, number>;
        engine.deck = [{ id: 'w1', color: 'white', rank: 1 }]; 
        engine.logLines = ["Game started"];
        engine.hints = 8;
        engine.strikes = 0;


        const move: Move = { type: "play", playerId: p1Id, cardIndex: 0 };
        engine.performMove(move);

        const snapshot = engine.snapshot();
        
        expect(snapshot.fireworks.red).toBe(1); 
        
        const p1 = snapshot.players.find(p => p.id === p1Id);
        expect(p1?.hand.length).toBe(1); 
        expect(p1?.hand[0].id).toBe('w1'); 
        
        expect(snapshot.currentPlayerIndex).toBe(1); 
        
        expect(snapshot.logLines).toContain('Game started');
        expect(snapshot.logLines).toContain('[Turn 1] Player 1 successfully played red 1');
    });

    test('Play: Should fail to play and receive a strike', () => {
        const p1Id = 'p1';
        const cardToPlay: Card = { id: 'r2', color: 'red', rank: 2 }; 

        const engine = new GameEngine();
        
        const players: Player[] = [
            createPlayer(p1Id, 'Player 1', [cardToPlay], [{ color: 'red', rank: 2 }]),
        ];
        
        engine.players = players;
        engine.fireworks = { red: 0, blue: 0, green: 0, yellow: 0, white: 0 } as Record<Color, number>;
        engine.deck = [{ id: 'w1', color: 'white', rank: 1 }]; 
        engine.logLines = ["Game started"];
        engine.hints = 8;
        engine.strikes = 0;

        const move: Move = { type: "play", playerId: p1Id, cardIndex: 0 };
        engine.performMove(move);

        const snapshot = engine.snapshot();
        
        expect(snapshot.fireworks.red).toBe(0); 
        
        expect(snapshot.strikes).toBe(1); 
        
        expect(snapshot.discard[0].id).toBe('r2');
        
        const p1 = snapshot.players.find(p => p.id === p1Id);
        expect(p1?.hand.length).toBe(1); 
        expect(p1?.hand[0].id).toBe('w1'); 

        expect(snapshot.logLines).toContain('[Turn 1] Player 1 failed play red 2 — strike 1');
    });

    test('Discard: Should successfully discard a card and gain a hint', () => {
        const p1Id = 'p1';
        const cardToDiscard: Card = { id: 'r2', color: 'red', rank: 2 }; 

        const engine = new GameEngine();
        
        const players: Player[] = [
            createPlayer(p1Id, 'Player 1', [cardToDiscard], [{}]),
            createPlayer('p2', 'Player 2', [{ id: 'b1', color: 'blue', rank: 1 }], [{}])
        ];
        
        engine.players = players;
        engine.fireworks = { red: 0, blue: 0, green: 0, yellow: 0, white: 0 } as Record<Color, number>;
        engine.deck = [{ id: 'w1', color: 'white', rank: 1 }]; 
        engine.logLines = ["Game started"];
        engine.hints = 5; 
        engine.strikes = 0;

        const move: Move = { type: "discard", playerId: p1Id, cardIndex: 0 };
        engine.performMove(move);

        const snapshot = engine.snapshot();
        
        expect(snapshot.hints).toBe(6); 
        
        expect(snapshot.discard[0].id).toBe('r2');
        
        const p1 = snapshot.players.find(p => p.id === p1Id);
        expect(p1?.hand.length).toBe(1); 
        expect(p1?.hand[0].id).toBe('w1'); 
        
        expect(snapshot.currentPlayerIndex).toBe(1);
    });
    
    test('Hint: Should update target knownInfo and decrease hints', () => {
        const p1Id = 'p1';
        const p2Id = 'p2';
        
        const cardInP2Hand: Card = { id: 'b2', color: 'blue', rank: 2 }; 

        const engine = new GameEngine();
        
        const players: Player[] = [
            createPlayer(p1Id, 'Player 1', [{ id: 'w1', color: 'white', rank: 1 }], [{}]),
            createPlayer(p2Id, 'Player 2', [cardInP2Hand], [{}]),
        ];
        
        engine.players = players;
        engine.fireworks = { red: 0, blue: 0, green: 0, yellow: 0, white: 0 } as Record<Color, number>;
        engine.deck = []; 
        engine.logLines = ["Game started"];
        engine.hints = 4; 
        engine.strikes = 0;

        const move: Move = { 
            type: "hint", 
            playerId: p1Id, 
            targetId: p2Id, 
            hint: { color: 'blue' } 
        };
        engine.performMove(move);

        const snapshot = engine.snapshot();
        
        expect(snapshot.hints).toBe(3); 
        
        const p2 = snapshot.players.find(p => p.id === p2Id);
        expect(p2?.knownInfo[0].color).toBe('blue');
        expect(p2?.knownInfo[0].rank).toBeUndefined(); 
        
        expect(snapshot.currentPlayerIndex).toBe(1);
    });

    test('Play: Should gain a hint when playing a Rank 5 card', () => {
        const p1Id = 'p1';
        const cardToPlay: Card = { id: 'r5', color: 'red', rank: 5 }; 
        
        const engine = new GameEngine();
        
        const players: Player[] = [
            createPlayer(p1Id, 'Player 1', [cardToPlay], [{ color: 'red', rank: 5 }]),
        ];
        
        engine.players = players;
        engine.fireworks = { red: 4, blue: 0, green: 0, yellow: 0, white: 0 } as Record<Color, number>;
        engine.deck = [{ id: 'w1', color: 'white', rank: 1 }]; 
        engine.logLines = ["Game started"];
        engine.hints = 5; 
        engine.strikes = 0;

        const move: Move = { type: "play", playerId: p1Id, cardIndex: 0 };
        engine.performMove(move);

        const snapshot = engine.snapshot();
        
        expect(snapshot.hints).toBe(6); 
        expect(snapshot.fireworks.red).toBe(5);
        expect(snapshot.logLines).toContain('[Turn 1] Completed a 5 — gained a hint.');
    });

    test('Play: Should NOT gain a hint when playing a Rank 5 card if hints is already 8', () => {
        const p1Id = 'p1';
        const cardToPlay: Card = { id: 'r5', color: 'red', rank: 5 }; 

        const engine = new GameEngine();
        
        const players: Player[] = [
            createPlayer(p1Id, 'Player 1', [cardToPlay], [{ color: 'red', rank: 5 }]),
        ];
        
        engine.players = players;
        engine.fireworks = { red: 4, blue: 0, green: 0, yellow: 0, white: 0 } as Record<Color, number>;
        engine.deck = [{ id: 'w1', color: 'white', rank: 1 }]; 
        engine.logLines = ["Game started"];
        engine.hints = 8; 
        engine.strikes = 0;

        const move: Move = { type: "play", playerId: p1Id, cardIndex: 0 };
        engine.performMove(move);

        const snapshot = engine.snapshot();
        
        expect(snapshot.hints).toBe(8); 
        expect(snapshot.fireworks.red).toBe(5);
        expect(snapshot.logLines).not.toContain('Completed a 5 — gained a hint.');
    });

    test('Game Over: Should set finished = true after the 3rd strike', () => {
        const p1Id = 'p1';
        const cardToPlay: Card = { id: 'r2', color: 'red', rank: 2 }; 

        const engine = new GameEngine();
        
        const players: Player[] = [
            createPlayer(p1Id, 'Player 1', [cardToPlay], [{ color: 'red', rank: 2 }]),
        ];
        
        engine.players = players;
        engine.fireworks = { red: 0, blue: 0, green: 0, yellow: 0, white: 0 } as Record<Color, number>;
        engine.deck = [{ id: 'w1', color: 'white', rank: 1 }]; 
        engine.logLines = ["Game started"];
        engine.hints = 8;
        engine.strikes = 2; 

        const move: Move = { type: "play", playerId: p1Id, cardIndex: 0 };
        engine.performMove(move); 

        const snapshot = engine.snapshot();
        
        expect(snapshot.strikes).toBe(3); 
        expect(snapshot.finished).toBe(true); 
        expect(snapshot.logLines).toContain('[Turn 1] Game over — too many strikes');
    });

    test('Game Over: Should set finalTurnsRemaining and finish after the last turn', () => {
        const p1Id = 'p1';
        const p2Id = 'p2';
        const cardToPlay: Card = { id: 'r1', color: 'red', rank: 1 }; 

        const engine = new GameEngine();
        
        const players: Player[] = [
            createPlayer(p1Id, 'Player 1', [cardToPlay], [{ color: 'red', rank: 1 }]),
            createPlayer(p2Id, 'Player 2', [{ id: 'b1', color: 'blue', rank: 1 }], [{}])
        ];
        
        engine.players = players;
        engine.fireworks = { red: 0, blue: 0, green: 0, yellow: 0, white: 0 } as Record<Color, number>;
        engine.deck = []; 
        engine.logLines = ["Game started"];
        engine.hints = 8;
        engine.strikes = 0;

        engine.performMove({ type: "play", playerId: p1Id, cardIndex: 0 }); 

        let snapshot = engine.snapshot();
        expect(snapshot.logLines).toContain('[Turn 1] Deck empty — final round begins');
        expect(engine.finalTurnsRemaining).toBe(1); 

        engine.performMove({ type: "play", playerId: p2Id, cardIndex: 0 }); 

        snapshot = engine.snapshot();
        expect(engine.finalTurnsRemaining).toBe(0); 
        expect(snapshot.finished).toBe(true);
        expect(snapshot.logLines).toContain('[Turn 2] Final round completed — game finished');
    });
});