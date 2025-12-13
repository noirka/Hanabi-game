import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { GameView } from './ui/GameView';
import { type GameSnapshot, type Move } from "./types"; 

const API_URL = 'http://localhost:5000'; 

const MY_PLAYER_INDEX = 0; 

interface SetupScreenProps {
    onStartGame: (numBots: number) => void;
    isLoading: boolean;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame, isLoading }) => {
    const botOptions = [1, 2, 3, 4]; 
    
    const buttonStyle: React.CSSProperties = {
        padding: '12px 25px',
        margin: '10px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        background: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: 5,
        boxShadow: '0 0 10px #4CAF5088',
        transition: 'background 0.2s, box-shadow 0.2s',
        minWidth: 150
    };

    const handleButtonClick = (count: number) => {
        if (!isLoading) {
            onStartGame(count);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh', 
            background: '#121212',
            color: 'white'
        }}>
            <h1 style={{ color: '#ffcf00', textShadow: '0 0 5px #ffcf0088' }}>Hanabi Online</h1>
            <h3 style={{ marginBottom: 30 }}>Choose number of opponents (Bots):</h3>
            <div>
                {isLoading ? (
                    <p>Connecting and creating game...</p>
                ) : 
                    botOptions.map((count: number) => ( 
                        <button 
                            key={count} 
                            onClick={() => handleButtonClick(count)}
                            style={buttonStyle}
                        >
                            {count} Bot{count > 1 ? 's' : ''} 
                            <br />
                            (Total {count + 1} Players)
                        </button>
                    ))
                }
            </div>
        </div>
    );
};

export default function App() {
    const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameId, setGameId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.body.style.background = "#121212"; 
        document.body.style.color = "white";

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [socket]);

    const startGame = async (botsCount: number) => {
        setIsLoading(true);
        setError(null);
        setSnapshot(null);

        try {
            const response = await fetch(`${API_URL}/api/game/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerCount: botsCount + 1 }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(`Failed to create game: ${errData.error || response.statusText}`);
            }

            const data = await response.json();
            const newGameId = data.gameId;
            const initialState = data.state;

            const newSocket = io(API_URL);

            newSocket.on('connect', () => {
                console.log(`Socket connected: ${newSocket.id}`);
                newSocket.emit('joinGame', newGameId);
            });

            newSocket.on('gameStateUpdate', (newState: GameSnapshot) => {
                setSnapshot(newState);
                console.log("State updated by server."); 
            });

            newSocket.on('moveError', (message: string) => {
                console.error("Server move error:", message);
                setError(`Move Error: ${message}`);
            });

            newSocket.on('error', (message: string) => {
                 console.error("Socket error:", message);
                setError(`Socket Error: ${message}`);
            });


            setSocket(newSocket);
            setGameId(newGameId);
            setSnapshot(initialState);
            
        } catch (err: any) {
            console.error("Game setup failed:", err.message);
            setError(err.message || 'Failed to start game.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMove = async (move: Move) => { 
        if (!socket || !gameId) {
            setError("Not connected to a game.");
            return;
        }
        
        socket.emit('performMove', move);
    };

    if (!gameId) {
        return (
            <SetupScreen onStartGame={startGame} isLoading={isLoading} />
        );
    }
    
    if (error) {
        return <div style={{ padding: 50, color: 'red' }}>Error: {error}</div>;
    }

    if (!snapshot) return <div style={{ padding: 50, color: '#aaa' }}>Loading game state...</div>;

   return <GameView 
        game={snapshot} 
        onMove={handleMove} 
        myPlayerIndex={MY_PLAYER_INDEX} 
    />;
}