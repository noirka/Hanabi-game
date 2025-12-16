import { type Move, type GameSnapshot as GameState } from "../types.js"; 

const API_BASE_URL = 'http://localhost:5000/api/game';

export async function createNewGame(playerCount: number): Promise<{ gameId: string, state: GameState }> {
    const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerCount })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create game: ${response.statusText}`);
    }
    
    return response.json();
}

export async function sendMove(gameId: string, move: Move): Promise<{ state: GameState }> {
    const response = await fetch(`${API_BASE_URL}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, move })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Failed to process move: ${response.statusText}`);
    }
    
    return data;
}

export async function fetchGameState(gameId: string): Promise<GameState> {
    const response = await fetch(`${API_BASE_URL}/state/${gameId}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch state: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.state;
}