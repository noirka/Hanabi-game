import io from 'socket.io-client';
import { httpServer, activeGames } from '../server';
import request from 'supertest';
import { Move } from '../game/types';

let serverPort: number; 

describe('Socket.IO (WebSocket) Testing', () => {
    let clientSocket: any;
    let gameId: string;
    let p1SocketId: string; 
    let game: any; 

    beforeAll(async () => {
        await new Promise<void>((resolve) => {
            httpServer.listen(0, () => {
                serverPort = (httpServer.address() as any).port;
                resolve();
            });
        });
        
        const createResponse = await request(httpServer)
            .post('/api/game/create')
            .send({ playerCount: 2 }) 
            .expect(200);

        gameId = createResponse.body.gameId;
        
        clientSocket = io(`http://localhost:${serverPort}`, { 
            transports: ['websocket'],
            forceNew: true 
        });

        await new Promise<void>((resolve) => {
            clientSocket.on('connect', () => {
                p1SocketId = clientSocket.id;
                resolve();
            });
        });

        await new Promise<void>((resolve) => {
            clientSocket.emit('joinGame', gameId);
            clientSocket.once('gameStateUpdate', (state: any) => {
                game = activeGames.get(gameId)!; 
                resolve();
            });
        });
    }, 15000);

    afterAll(async () => {
        if (clientSocket) {
            clientSocket.close();
        }
        await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    });
    
    test('Client should successfully join game and server should assign socket ID to Player 1', async () => {
        expect(game).toBeDefined();
        expect(game!.players[0].id).toBe(p1SocketId); 
    });

    test('Player should perform a valid Discard move and receive gameStateUpdate (Integration)', async () => {
        game.hints = 7;
        game.currentPlayerIndex = 0;
        
        const gameBeforeMove = activeGames.get(gameId)!;
        expect(gameBeforeMove.currentPlayerIndex).toBe(0);

        const move: Move = { type: 'discard', cardIndex: 0, playerId: p1SocketId };

        const updatePromise = new Promise<any>((resolve) => {
            clientSocket.once('gameStateUpdate', (state: any) => {
                resolve(state);
            });
        });
        
        clientSocket.emit('performMove', move);
        const state = await updatePromise;

        expect(state.discard.length).toBe(1); 
        expect(state.hints).toBe(8); 
        expect(state.currentPlayerIndex).toBe(1); 
    });

    test('Performing an invalid move (e.g., hinting with 0 hints) should result in moveError', async () => {
        game.currentPlayerIndex = 0; 
        game.hints = 0; 

        const invalidMove: Move = { type: 'hint', targetId: game.players[1].id, hint: { color: 'red' }, playerId: p1SocketId };
        
        const errorPromise = new Promise<string>((resolve) => {
            clientSocket.once('moveError', (error: string) => {
                resolve(error);
            });
        });
        
        clientSocket.emit('performMove', invalidMove);
        const errorMessage = await errorPromise;
        
        expect(errorMessage).toContain('No hint tokens left'); // <--- ВИПРАВЛЕНО
        
        game.hints = 8;
    });
});