import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import * as socketIO from 'socket.io-client';
import type { GameSnapshot, Player } from '../types'; 

const originalConsoleError = console.error;
const originalConsoleLog = console.log;

const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    id: 'mock-socket-id',
};
jest.mock('socket.io-client', () => ({
    io: jest.fn(() => mockSocket),
}));

let fetchSpy: jest.SpyInstance;

const mockPlayerHuman: Player = { id: 'human', name: 'human', hand: [], knownInfo: [], isBot: false };
const mockPlayerBot: Player = { id: 'bot1', name: 'Bot 1', hand: [], knownInfo: [], isBot: true };

const mockGameSnapshot: GameSnapshot = { 
    players: [mockPlayerHuman, mockPlayerBot],
    fireworks: { red: 0, blue: 0, green: 0, yellow: 0, white: 0 } as any, 
    hints: 8,
    strikes: 0,
    deckCount: 40, 
    logLines: [],
    discard: [],
    turn: 1,
    currentPlayerIndex: 0,
    finished: false,
};

jest.mock('../ui/GameView', () => ({
    GameView: ({ game, onMove }: { game: typeof mockGameSnapshot, onMove: (move: any) => void }) => (
        <div data-testid="game-view">
            <h1>Game View Active</h1>
            <p>Hints: {game.hints}</p>
            <button data-testid="move-btn" onClick={() => onMove({ type: 'play', playerId: 'human', cardIndex: 0 })} />
        </div>
    ),
}));


describe('App Component (Setup, Connection, and State Management)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        if (!window.fetch) {
             window.fetch = jest.fn() as any;
        }

        fetchSpy = jest.spyOn(window, 'fetch'); 

        console.error = jest.fn();
        console.log = jest.fn();
    });
    
    afterEach(() => {
        fetchSpy.mockRestore(); 
        
        console.error = originalConsoleError;
        console.log = originalConsoleLog;
    });

    test('успішний запуск гри: викликає API, підключає Socket та переходить до GameView', async () => {
        fetchSpy.mockResolvedValue({
            ok: true,
            json: async () => ({
                gameId: 'test-game-123',
                state: mockGameSnapshot,
            }),
        } as Response);

        render(<App />);
        await fireEvent.click(screen.getByText(/1 Bot/));

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.stringContaining('/api/game/create'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ playerCount: 2 }),
                })
            );
            expect(socketIO.io).toHaveBeenCalled();
            expect(screen.getByTestId('game-view')).toBeInTheDocument();
        });
    });

    test('обробляє помилку створення гри API', async () => {
        fetchSpy.mockResolvedValue({
            ok: false,
            statusText: 'Internal Server Error',
            json: async () => ({ error: 'Database connection failed' }),
        } as Response);

        render(<App />);
        await fireEvent.click(screen.getByText(/1 Bot/)); 

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith(
                "Game setup failed:",
                "Failed to create game: Database connection failed"
            );
            
            const errorElement = screen.queryByText((content, _) => {
                return content.includes('Database connection failed');
            });

            expect(errorElement).toBeInTheDocument();
        });
    });

    test('обробляє оновлення стану гри від сервера', async () => {
        fetchSpy.mockResolvedValue({
            ok: true,
            json: async () => ({ gameId: 'test-game-123', state: mockGameSnapshot }),
        } as Response);
        
        let gameStateUpdateCallback: (newState: GameSnapshot) => void = () => {};

        mockSocket.on.mockImplementation((event, callback) => {
            if (event === 'gameStateUpdate') {
                gameStateUpdateCallback = callback;
            }
        });

        render(<App />);
        await fireEvent.click(screen.getByText(/1 Bot/));

        await waitFor(() => {
            expect(screen.getByText('Hints: 8')).toBeInTheDocument();
        });
        
        const updatedSnapshot: GameSnapshot = { ...mockGameSnapshot, hints: 5 };
        
        act(() => {
            gameStateUpdateCallback(updatedSnapshot);
        });
        
        expect(screen.getByText('Hints: 5')).toBeInTheDocument();
        
        expect(console.log).toHaveBeenCalledWith("State updated by server.");
    });
    
    test('викликає performMove через socket.emit при дії onMove', async () => {
        fetchSpy.mockResolvedValue({
            ok: true,
            json: async () => ({ gameId: 'test-game-123', state: mockGameSnapshot }),
        } as Response);

        render(<App />);
        await fireEvent.click(screen.getByText(/1 Bot/));

        await waitFor(() => {
             fireEvent.click(screen.getByTestId('move-btn'));
        });
        
        const expectedMove = { type: 'play', playerId: 'human', cardIndex: 0 };
        expect(mockSocket.emit).toHaveBeenCalledWith('performMove', expectedMove);
    });
});