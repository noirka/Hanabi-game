import { io, Socket } from "socket.io-client";
import { type GameSnapshot, type Move } from "../types"; 

const SOCKET_URL = "http://localhost:5000";
export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false, 
});

export async function createNewGame(playerCount: number) {
    const response = await fetch(`${SOCKET_URL}/api/game/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerCount }),
    });
    if (!response.ok) {
        throw new Error("Failed to create game");
    }
    return response.json() as Promise<{ gameId: string, state: GameSnapshot }>;
}

export function sendMoveSocket(move: Move) {
    if (socket.connected) {
        socket.emit('performMove', move);
    } else {
        console.error("Socket not connected, move ignored.");
    }
}

export function joinGameSocket(gameId: string) {
    socket.connect();
    socket.emit('joinGame', gameId);
}