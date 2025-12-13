import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import ClientIO, { Socket as ClientSocket } from 'socket.io-client'; 

import { GameEngine } from '../game/engine'; 
import { Player, Card, Move, GameSnapshot } from '../game/types'; 
import { AddressInfo } from 'net';

const mockCard: Card = { id: 'r1', color: 'red', rank: 1 } as Card;

function setupServerAndClients(): Promise<{ 
    server: SocketIOServer, 
    client1: ClientSocket, 
    client2: ClientSocket, 
    url: string 
}> {
    return new Promise((resolve) => {
        const httpServer = createServer();
        const io = new SocketIOServer(httpServer);
        
        let client1: ClientSocket;
        let client2: ClientSocket;
        
        const gameEngine = new GameEngine();
        
        const client1Id = 'client1_id';
        const client2Id = 'client2_id';

        gameEngine.players = [
            { id: client1Id, name: 'Player 1', isBot: false, hand: [mockCard], knownInfo: [{}] },
            { id: client2Id, name: 'Player 2', isBot: false, hand: [mockCard], knownInfo: [{}] },
        ];
        gameEngine.deck = [{ id: 'b1', color: 'blue', rank: 1 } as Card];
        gameEngine.currentPlayerIndex = 0; 
        gameEngine.turn = 1;

        const connectedSockets: string[] = [];

        io.on('connection', (socket) => {
            if (connectedSockets.length === 0) {
                socket.data.playerId = client1Id;
            } else if (connectedSockets.length === 1) {
                socket.data.playerId = client2Id;
            }
            connectedSockets.push(socket.id);


            socket.on('move', (move: Omit<Move, 'playerId'>) => {
                const playerId = socket.data.playerId as string;
                if (!playerId) return;

                const fullMove: Move = { ...move, playerId: playerId } as Move;

                try {
                    gameEngine.performMove(fullMove);
                    io.emit('gameUpdate', gameEngine.snapshot()); 
                } catch (e) {
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
                    (client1 as any).data = { playerId: client1Id }; 
                    (client2 as any).data = { playerId: client2Id };
                    resolve({ server: io, client1, client2, url });
                }
            };
            
            client1.on('connect', checkReady);
            client2.on('connect', checkReady);
        });
    });
}

describe('Integration Test: Frontend ↔ Backend (Socket.io Flow)', () => {
    let server: SocketIOServer;
    let client1: ClientSocket; 
    let client2: ClientSocket; 
    
    beforeAll(async () => {
        const setup = await setupServerAndClients();
        server = setup.server;
        client1 = setup.client1;
        client2 = setup.client2;
    });

    afterAll(() => {
        client1.close();
        client2.close();
        server.close();
    });

    test('Player 1 move should trigger game update visible to Player 2', (done) => {
        client2.once('gameUpdate', (snapshot: GameSnapshot) => {
            try {
                expect(snapshot.currentPlayerIndex).toBe(1); 
                expect(snapshot.turn).toBe(2);
                expect(snapshot.discard.length).toBe(1); 
                
                done(); 
            } catch (err) {
                done(err); 
            }
        });

        const move: Omit<Move, 'playerId'> = { 
            type: "discard", 
            cardIndex: 0 
        };
        
        client1.emit('move', move); 
    });

    test('Move from the wrong player is rejected (No update sent)', (done) => {
        const wrongPlayerMove: Omit<Move, 'playerId'> = { 
            type: "discard", 
            cardIndex: 0 
        };
        
        let updateReceived = false;

        client1.once('gameUpdate', () => {
            updateReceived = true;
        });

        client1.emit('move', wrongPlayerMove); 

        setTimeout(() => {
            try {
                expect(updateReceived).toBe(false); 
                done();
            } catch (err) {
                done(err);
            }
        }, 100); 
    });
});