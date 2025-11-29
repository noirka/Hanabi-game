import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
   cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
   }
});

app.use(express.json());

import authRouter from './routes/auth.js';

app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
   res.send('Hanabi Backend is running!');
});

io.on('connection', (socket) => {
   console.log(`User connected: ${socket.id}`);

   socket.on('join_lobby', (data) => {
      console.log(`User ${socket.id} joined lobby.`);
   });

   socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
   });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
   console.log(`Server listening on port ${PORT}`);
});