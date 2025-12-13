import request from 'supertest';
import { httpServer, activeGames } from '../server'; 

describe('REST API Testing', () => {
    afterAll(async () => {
        await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    });

    test('POST /api/game/create should create a 3-player game', async () => {
        const playerCount = 3;
        
        const response = await request(httpServer)
            .post('/api/game/create')
            .send({ playerCount })
            .expect(200);
        expect(response.body).toHaveProperty('gameId');
        expect(response.body).toHaveProperty('state');

        const { gameId, state } = response.body;

        expect(state.players.length).toBe(playerCount);
        expect(state.players[0].name).toBe('Player'); 
        expect(state.players[1].name).toBe('Bot 1'); 
        expect(state.players[0].id).toBe('human'); 

        expect(activeGames.has(gameId)).toBe(true);
        activeGames.delete(gameId); 
    });

    test('POST /api/game/create should return 400 for invalid player count (1)', async () => {
        await request(httpServer)
            .post('/api/game/create')
            .send({ playerCount: 1 })
            .expect(400);
    });

    test('POST /api/game/create should return 400 for invalid player count (6)', async () => {
        await request(httpServer)
            .post('/api/game/create')
            .send({ playerCount: 6 })
            .expect(400);
    });
});