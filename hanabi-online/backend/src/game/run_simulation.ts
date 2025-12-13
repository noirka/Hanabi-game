import { GameEngine } from './engine';
import { decideMove } from './bot'; 
import { Player } from './types';

function getScore(engine: GameEngine): number {
    return Object.values(engine.fireworks).reduce((sum, rank) => sum + rank, 0);
}

function runSimulation(playerCount: number): { score: number; turns: number; strikes: number } {
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
        id: `bot-${i + 1}`,
        name: `Bot ${i + 1}`,
        isBot: true,
        hand: [],
        knownInfo: [],
    }));

    const engine = new GameEngine();
    engine.setup(players);

    while (!engine.finished) {
        const currentPlayer = engine.players[engine.currentPlayerIndex];
        
        try {
            const move = decideMove(engine, currentPlayer);
            
            engine.performMove(move); 

        } catch (e) {
            break; 
        }

        if (engine.turn > 5000) {
            break;
        }
    }

    return { 
        score: getScore(engine), 
        turns: engine.turn,
        strikes: engine.strikes
    };
}


const NUM_GAMES = 1000;
const NUM_PLAYERS = 3; 

function runMassSimulations() {
    console.log(`\n============================================`);
    console.log(`  HANABI AI SIMULATION: ${NUM_GAMES} Games`);
    console.log(`  Players: ${NUM_PLAYERS} Bots`);
    console.log(`============================================`);

    const results: number[] = [];
    let perfectGames = 0;
    let totalStrikes = 0;
    let totalTurns = 0;
    const MAX_SCORE = 25;

    const startTime = process.hrtime(); 

    for (let i = 0; i < NUM_GAMES; i++) {
        const result = runSimulation(NUM_PLAYERS);
        
        results.push(result.score);
        totalStrikes += result.strikes;
        totalTurns += result.turns;

        if (result.score === MAX_SCORE) {
            perfectGames++;
        }
        
        if ((i + 1) % 100 === 0) {
            process.stdout.write(`\r[Progress: ${(i + 1)}/${NUM_GAMES} games completed]`);
        }
    }

    const endTime = process.hrtime(startTime);
    const executionTimeSeconds = endTime[0] + endTime[1] / 1e9;

    const minScore = Math.min(...results);
    const maxScore = Math.max(...results);
    const averageScore = results.reduce((a, b) => a + b, 0) / NUM_GAMES;
    const perfectPercentage = (perfectGames / NUM_GAMES) * 100;
    const avgStrikes = totalStrikes / NUM_GAMES;
    const avgTurns = totalTurns / NUM_GAMES;

    console.log(`\r[Progress: ${NUM_GAMES}/${NUM_GAMES} games completed]`);
    console.log(`\n--- Results ---`);
    console.log(`Total Execution Time: ${executionTimeSeconds.toFixed(2)}s`);
    console.log(`Average Score: ${averageScore.toFixed(2)} / ${MAX_SCORE}`);
    console.log(`Perfect Games (Score 25): ${perfectGames} (${perfectPercentage.toFixed(2)}%)`);
    console.log(`Min/Max Score: ${minScore} / ${maxScore}`);
    console.log(`Average Strikes: ${avgStrikes.toFixed(2)}`);
    console.log(`Average Turns: ${avgTurns.toFixed(2)}`);
    console.log(`-----------------\n`);
}

runMassSimulations();