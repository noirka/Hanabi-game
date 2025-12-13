import { GameEngine } from './engine';
import { decideMove } from './bot'; 
import { Player } from './types';
import * as process from 'process';

function getScore(engine: GameEngine): number {
    return Object.values(engine.fireworks).reduce((sum, rank) => sum + rank, 0);
}

function runSimulation(playerCount: number): { score: number; strikes: number; totalMoveTimeNs: number; moveCount: number } {
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
        id: `bot-${i + 1}`,
        name: `Bot ${i + 1}`,
        isBot: true,
        hand: [],
        knownInfo: [],
    }));

    const engine = new GameEngine();
    engine.setup(players);

    let totalMoveTimeNs = 0; 
    let moveCount = 0;

    while (!engine.finished) {
        const currentPlayer = engine.players[engine.currentPlayerIndex];
        
        try {
            const start = process.hrtime.bigint();
            
            const move = decideMove(engine, currentPlayer);
            
            const end = process.hrtime.bigint();
            totalMoveTimeNs += Number(end - start);
            moveCount++;

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
        strikes: engine.strikes,
        totalMoveTimeNs,
        moveCount
    };
}


const NUM_GAMES = 1000;
const NUM_PLAYERS = 3; 

function runMassSimulations() {
    console.log(`\n============================================`);
    console.log(`  HANABI AI PERFORMANCE TEST: ${NUM_GAMES} Games`);
    console.log(`  Players: ${NUM_PLAYERS} Bots`);
    console.log(`============================================`);

    let totalStrikes = 0;
    let totalMoveTimeNs = 0;
    let totalMoveCount = 0;
    let totalScore = 0;

    const startTime = process.hrtime(); 

    for (let i = 0; i < NUM_GAMES; i++) {
        const result = runSimulation(NUM_PLAYERS);
        
        totalStrikes += result.strikes;
        totalMoveTimeNs += result.totalMoveTimeNs;
        totalMoveCount += result.moveCount;
        totalScore += result.score;
        
        if ((i + 1) % 100 === 0) {
            process.stdout.write(`\r[Progress: ${(i + 1)}/${NUM_GAMES} games completed]`);
        }
    }

    const endTime = process.hrtime(startTime);
    const executionTimeSeconds = endTime[0] + endTime[1] / 1e9;

    const avgTimePerMoveNs = totalMoveCount > 0 ? totalMoveTimeNs / totalMoveCount : 0;
    const avgTimePerMoveMs = avgTimePerMoveNs / 1_000_000; 
    const averageScore = totalScore / NUM_GAMES;

    console.log(`\r[Progress: ${NUM_GAMES}/${NUM_GAMES} games completed]`);
    console.log(`\n--- Performance & Final Score Results ---`);
    console.log(`Total Execution Time: ${executionTimeSeconds.toFixed(2)}s`);
    console.log(`Average Score (for context): ${averageScore.toFixed(2)} / 25`);
    console.log(`Total Moves Tested: ${totalMoveCount}`);
    console.log(`\n--- Time Metrics ---`);
    console.log(`Average Time Per Move (ms): ${avgTimePerMoveMs.toFixed(3)}ms`);
    console.log(`Average Time Per Move (μs): ${(avgTimePerMoveNs / 1000).toFixed(1)}μs`);
    console.log(`-----------------------------------------\n`);
}

runMassSimulations();