import { io, Socket } from "socket.io-client";
import { type GameSnapshot, type Move } from "../types"; 

// Ініціалізація з'єднання Socket.IO
// ПРИМІТКА: Припущено, що ваш бекенд працює на порту 5000
const SOCKET_URL = "http://localhost:5000";
export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false, // Підключаємось вручну в App.tsx
});

// Функція для створення гри через REST (залишаємо REST тільки для цього)
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

// Функція для відправки ходу через Socket.IO
export function sendMoveSocket(move: Move) {
    if (socket.connected) {
        // Ми надсилаємо move без playerId, оскільки бекенд візьме його з socket.id
        socket.emit('performMove', move);
    } else {
        console.error("Socket not connected, move ignored.");
    }
}

// Функція для приєднання до ігрової кімнати
export function joinGameSocket(gameId: string) {
    socket.connect();
    socket.emit('joinGame', gameId);
}