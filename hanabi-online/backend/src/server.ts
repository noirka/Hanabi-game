import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { GameEngine as HanabiRoom } from "./game/engine";
import { Move, GameSnapshot } from "./game/types";

const app = express();
const httpServer = createServer(app);
const PORT = 5000;

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

const activeGames: Map<string, HanabiRoom> = new Map();
const socketToGameMap: Map<string, string> = new Map();


function broadcastGameState(game: HanabiRoom, io: Server) {
    game.players.forEach((player, index) => {
        const visibleState = game.getVisibleState(index);
        io.to(player.id).emit('gameStateUpdate', visibleState);
    });
}

io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('joinGame', (gameId: string) => {
        const game = activeGames.get(gameId);
        if (!game) {
            socket.emit('error', 'Game not found.');
            return;
        }

        const humanPlayer = game.players.find(p => p.id === 'human');
        if (humanPlayer) {
            const oldGameId = socketToGameMap.get(socket.id);
            if (oldGameId) {
            }
            
            humanPlayer.id = socket.id; 
            socketToGameMap.set(socket.id, gameId);
            console.log(`Player 'human' reassigned to socket ID: ${socket.id}`);
        }

        broadcastGameState(game, io);
    });

    socket.on('performMove', async (move: Move) => {
        const gameId = socketToGameMap.get(socket.id);
        const game = gameId ? activeGames.get(gameId) : undefined;

        if (!game) {
            socket.emit('error', 'Game session not active.');
            return;
        }
        
        const playerMove: Move = { ...move, playerId: socket.id };

        try {
            game.performMove(playerMove); 
            broadcastGameState(game, io);
        } catch (error: any) {
            socket.emit('moveError', error.message || 'Invalid move attempt.');
        }
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        socketToGameMap.delete(socket.id);
    });
});

app.post("/api/game/create", (req: Request, res: Response) => {
    const { playerCount } = req.body;
    if (!playerCount || typeof playerCount !== 'number' || playerCount < 2 || playerCount > 5) {
        return res.status(400).json({ error: "Invalid player count (must be between 2 and 5)" });
    }

    const gameId = uuidv4();
    const newGame = new HanabiRoom();

    const players = [{ id: "human", name: "Player", hand: [], knownInfo: [], isBot: false }];
    for (let i = 1; i < playerCount; i++) {
        players.push({ id: `bot-${i}`, name: `Bot ${i}`, hand: [], knownInfo: [], isBot: true });
    }

    newGame.setup(players as any);
    activeGames.set(gameId, newGame);

    newGame.onChange(() => {
        broadcastGameState(newGame, io);
    });

    res.json({
        gameId: gameId,
        state: newGame.getVisibleState(0)
    });
});


app.get("/", (_req, res) => {
    res.send("Hanabi AI backend is running (Socket.IO mode)");
});

if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(PORT, () => {
        console.log(`Backend listening on http://localhost:${PORT}`);
    });
}

export { httpServer, activeGames, io };