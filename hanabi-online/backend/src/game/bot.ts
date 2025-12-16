import { GameEngine } from './engine';
import { Player, Move, Color, Rank, GameSnapshot, Card } from './types';

function getTotalCopies(rank: Rank): number {
    if (rank === 1) return 3;
    if (rank === 5) return 1;
    return 2;
}

function isPlayable(card: Card, snapshot: GameSnapshot): boolean {
    const nextRank = snapshot.fireworks[card.color] + 1;
    return card.rank === nextRank; 
}

function isSafeToDiscard(card: Card, snapshot: GameSnapshot): boolean {
    const { color, rank } = card;
    const required = getTotalCopies(rank);
    
    const playedCopies = snapshot.fireworks[color] >= rank ? 1 : 0;
    const discardedCopies = snapshot.discard.filter(d => d.color === color && d.rank === rank).length;
    
    return (playedCopies + discardedCopies) === required;
}

function findPlayCardIndex(player: Player, snapshot: GameSnapshot): number {
    for (let i = 0; i < player.hand.length; i++) {
        const info = player.knownInfo[i];

        if (info.color && info.rank) {
            const requiredRank = snapshot.fireworks[info.color] + 1;
            
            if (info.rank === requiredRank) {
                return i;
            }
        }
    }
    return -1;
}

function findBestHint(player: Player, snapshot: GameSnapshot): { 
    targetId: string, 
    hint: { color?: Color; rank?: Rank }, 
    isCritical: boolean 
} | null {
    const players = snapshot.players;
    const playerIndex = players.findIndex(p => p.id === player.id);
    const numPlayers = players.length;

    for (let j = 1; j < numPlayers; j++) {
        const targetIndex = (playerIndex + j) % numPlayers;
        const targetPlayer = players[targetIndex];
        
        let leftmostPlayableIndex = -1;
        for (let i = 0; i < targetPlayer.hand.length; i++) {
            if (isPlayable(targetPlayer.hand[i], snapshot)) {
                leftmostPlayableIndex = i;
                break; 
            }
        }

        if (leftmostPlayableIndex !== -1) {
            const card = targetPlayer.hand[leftmostPlayableIndex];
            const info = targetPlayer.knownInfo[leftmostPlayableIndex];
            
            if (!info.rank) {
                return { targetId: targetPlayer.id, hint: { rank: card.rank }, isCritical: true };
            }
            if (!info.color) {
                return { targetId: targetPlayer.id, hint: { color: card.color }, isCritical: true };
            }
        }
        
        for (let i = 0; i < targetPlayer.hand.length; i++) {
             const card = targetPlayer.hand[i];
             const info = targetPlayer.knownInfo[i];
             
             if (!info.color) {
                 return { targetId: targetPlayer.id, hint: { color: card.color }, isCritical: false };
             }
        }
        
        for (let i = 0; i < targetPlayer.hand.length; i++) {
             const info = targetPlayer.knownInfo[i];
             
             if (!info.rank) {
                 return { targetId: targetPlayer.id, hint: { rank: targetPlayer.hand[i].rank }, isCritical: false };
             }
        }
    }

    return null;
}

function findDiscardCardIndex(player: Player, snapshot: GameSnapshot): number {
    const knownInfo = player.knownInfo;
    const hand = player.hand;
    
    for (let i = 0; i < hand.length; i++) {
        const info = knownInfo[i];
        
        if (info.rank && info.rank !== 5 && info.color) { 
             if (info.rank <= snapshot.fireworks[info.color]) {
                 return i;
             }
        }
    }
    
    for (let i = 0; i < hand.length; i++) {
        if (isSafeToDiscard(hand[i], snapshot)) {
            return i;
        }
    }
    
    for (let i = 0; i < knownInfo.length; i++) {
        if (!knownInfo[i].color && !knownInfo[i].rank) {
            return i;
        }
    }
    
    for (let i = 0; i < knownInfo.length; i++) {
        const info = knownInfo[i];
        
        if (info.rank !== 5) { 
             return i;
        }
    }
    
    return 0; 
}

export function decideMove(engine: GameEngine, player: Player): Move {
    const snapshot = engine.snapshot();

    const playIndex = findPlayCardIndex(player, snapshot);
    if (playIndex !== -1) {
        return { type: "play", playerId: player.id, cardIndex: playIndex };
    }

    const hintData = findBestHint(player, snapshot);
    
    if (hintData) {
        const canHint = snapshot.hints > 0;
        
        if (snapshot.hints === 8) {
             return { 
                type: "hint", 
                playerId: player.id, 
                targetId: hintData.targetId, 
                hint: hintData.hint 
            } as Move;
        }

        if (hintData.isCritical && canHint) {
             return { 
                type: "hint", 
                playerId: player.id, 
                targetId: hintData.targetId, 
                hint: hintData.hint 
            } as Move;
        }
    }
    
    const cardIndex = findDiscardCardIndex(player, snapshot);
    return { type: "discard", playerId: player.id, cardIndex };
}