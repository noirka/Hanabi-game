import { createServer, Server as HTTPServer, IncomingMessage, ServerResponse } from 'http';
import { Server as SocketIOServer, DefaultEventsMap } from 'socket.io';
import ClientIO, { Socket as ClientSocket } from 'socket.io-client';
import { GameEngine } from '../game/engine'; 
import { Player, Card, Move, GameSnapshot, Color, Rank } from '../game/types'; 
import { AddressInfo } from 'net';

type SetupResult = { 
    server: HTTPServer<typeof IncomingMessage, typeof ServerResponse>, 
    client1: ClientSocket, 
    client2: ClientSocket, 
    io: SocketIOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> 
};

const REAL_MOCK_CARD: Card = { id: 'r1_extra', color: 'red' as Color, rank: 1 as Rank } as Card;

let gameEngineInstance = new GameEngine();
let cleanupListeners: Array<() => void> = [];

const client1Id = 'client1_id';
const client2Id = 'client2_id';

function waitForSocketEvent<T>(client: ClientSocket, eventName: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`Timeout waiting for event: ${eventName}`));
        }, 5000); 

        client.once(eventName, (data: T) => {
            clearTimeout(timeout);
            resolve(data);
        });
    });
}


function setupServerAndClients(): Promise<SetupResult> {
    return new Promise((resolve) => {
        const httpServer = createServer();
        const io: SocketIOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> = new SocketIOServer(httpServer);
        
        let client1: ClientSocket;
        let client2: ClientSocket;

        io.on('connection', (socket: any) => {
            
            socket.on('setPlayerId', (id: string) => {
                socket.data.playerId = id;
            });

            socket.on('move', (move: Omit<Move, 'playerId'>) => {
                const playerId = socket.data.playerId;
                if (!playerId) {
                    return; 
                }

                const fullMove: Move = { ...move, playerId: playerId } as Move;

                try {
                    gameEngineInstance.performMove(fullMove); 
                } catch (e) {
                    const errorMsg = e instanceof Error ? e.message : String(e);
                    if (!errorMsg.includes("It's not this player's turn")) {
                         console.error("Error performing move in test:", e);
                    }
                }
            });
        });

        httpServer.listen(() => {
            const port = (httpServer.address() as AddressInfo).port;
            const url = `http://localhost:${port}`;
            
            client1 = ClientIO(url);
            client2 = ClientIO(url);

            let connections = 0;
            const checkReady = () => {
                connections++;
                if (connections === 2) {
                    
                    client1.emit('setPlayerId', client1Id);
                    client2.emit('setPlayerId', client2Id);
                    
                    setTimeout(() => resolve({ server: httpServer, client1, client2, io }), 200); 
                }
            };
            
            client1.on('connect', checkReady);
            client2.on('connect', checkReady);
        });
    });
}

describe('Integration Test: Socket.io and Game Logic Flow', () => {
    let server: HTTPServer;
    let client1: ClientSocket;
    let client2: ClientSocket;
    let io: SocketIOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    
    const initialPlayers: Player[] = [
        { id: client1Id, name: 'Player 1', isBot: false, hand: [], knownInfo: [] },
        { id: client2Id, name: 'Player 2', isBot: false, hand: [], knownInfo: [] },
    ];
    
    const populateDeck = () => {
        for (let i = 0; i < 100; i++) {
            gameEngineInstance.deck.push(REAL_MOCK_CARD); 
        }
    };

    beforeAll(async () => {
        const setup = await setupServerAndClients();
        server = setup.server;
        client1 = setup.client1;
        client2 = setup.client2;
        io = setup.io;
    });

    afterAll(() => {
        client1.close();
        client2.close();
        io.close();
        server.close();
    });

    afterEach(() => {
        cleanupListeners.forEach(cleanup => cleanup());
        cleanupListeners = [];
    });

    beforeEach(() => {
        gameEngineInstance = new GameEngine();
        populateDeck(); 

        const cleanup = gameEngineInstance.onChange(() => { 
            const snapshot = gameEngineInstance.snapshot();
            io.emit('gameUpdate', snapshot); 
        });
        cleanupListeners.push(cleanup);
        
        gameEngineInstance.setup(initialPlayers);
    });

    test('Player 1 move should trigger game update visible to Player 2', async () => {
        const move = { 
            type: "hint" as const, 
            targetId: client2Id, 
            hint: { color: 'red' as Color } 
        } as Omit<Move, 'playerId'>;
        
        await Promise.all([
            waitForSocketEvent<GameSnapshot>(client1, 'gameUpdate'),
            waitForSocketEvent<GameSnapshot>(client2, 'gameUpdate') 
        ]);
        
        const updatePromise = waitForSocketEvent<GameSnapshot>(client2, 'gameUpdate');
        
        client1.emit('move', move); 

        const snapshot = await updatePromise;

        expect(snapshot.currentPlayerIndex).toBe(1); 
        expect(snapshot.turn).toBe(2);
    }, 7000); 


    test('Move from the wrong player is rejected (No update sent)', async () => {
        await Promise.all([
            waitForSocketEvent<GameSnapshot>(client1, 'gameUpdate'),
            waitForSocketEvent<GameSnapshot>(client2, 'gameUpdate') 
        ]);

        const wrongPlayerMove: Omit<Move, 'playerId'> = { type: "discard", cardIndex: 0 };
        
        let updateOccurred = false;
        const updateCheck = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => resolve(), 300); 
            
            const listener = () => {
                clearTimeout(timeout);
                updateOccurred = true;
                client1.removeAllListeners('gameUpdate');
                reject(new Error("UNEXPECTED UPDATE: Game update received after wrong player moved."));
            };
            
            client1.removeAllListeners('gameUpdate').on('gameUpdate', listener); 
        });
        
        client2.emit('move', wrongPlayerMove); 

        await updateCheck;
        
        expect(updateOccurred).toBe(false); 
        
    }, 1000); 


    test('Full Game E2E Simulation: Game ends successfully with Human/AI mixed players', async () => {
        const e2ePlayers: Player[] = [
            { id: client1Id, name: 'Human Player', isBot: false, hand: [], knownInfo: [] },
            { id: client2Id, name: 'AI Player', isBot: true, hand: [], knownInfo: [] },
        ];
        
        gameEngineInstance = new GameEngine();
        populateDeck(); 

        const cleanupE2E = gameEngineInstance.onChange(() => { 
            const snapshot = gameEngineInstance.snapshot();
            io.emit('gameUpdate', snapshot); 
        });
        cleanupListeners.push(cleanupE2E); 

        gameEngineInstance.setup(e2ePlayers); 
        
        let moveCounter = 0;
        const MAX_MOVES = 150; 
        
        let snapshot: GameSnapshot;
        
        try {
             snapshot = await waitForSocketEvent<GameSnapshot>(client1, 'gameUpdate');
        } catch(e) {
             throw new Error("Initial setup update failed");
        }

        while (!snapshot.finished && moveCounter < MAX_MOVES) {
            
            const currentPlayer = snapshot.players[snapshot.currentPlayerIndex];
            moveCounter++;

            if (currentPlayer.id === client1Id && !currentPlayer.isBot) {
                client1.emit('move', { type: "discard", cardIndex: 0 });
            }
            
            try {
                let update = await waitForSocketEvent<GameSnapshot>(client1, 'gameUpdate');
                
                if (update.players[update.currentPlayerIndex].id === client2Id && update.players[update.currentPlayerIndex].isBot) {
                    update = await waitForSocketEvent<GameSnapshot>(client1, 'gameUpdate');
                }
                
                snapshot = update;

            } catch (error) {
                if (error instanceof Error && error.message.includes('Timeout')) {
                    console.log(`E2E Simulation stopped due to timeout after ${moveCounter} moves.`);
                    break;
                }
                throw error;
            }
        }

        expect(snapshot.finished).toBe(true);
        expect(snapshot.strikes).toBeLessThan(3); 

    }, 20000); 
});