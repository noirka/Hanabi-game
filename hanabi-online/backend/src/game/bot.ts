import type { GameSnapshot, Player, Move, Card, Color, Rank } from "./types";
import type { GameEngine } from "./engine";

function isCardPlayableFromSnapshot(snapshot: GameSnapshot, card: Card): boolean {
    const top = snapshot.fireworks[card.color] ?? 0;
    return card.rank === (top + 1);
}

export function decideMove(engine: GameEngine, player: Player): Move {
    const snapshot: GameSnapshot = engine.snapshot();

    for (let i = 0; i < player.hand.length; i++) {
        const card = player.hand[i]; 
        const info = player.knownInfo[i];
        
        if (info.color) {
            const requiredRank = snapshot.fireworks[info.color] + 1;
            
            if (info.rank && info.rank === requiredRank) {
                 return { type: "play", playerId: player.id, cardIndex: i };
            }
            
             if (info.rank === 5) {
                 return { type: "play", playerId: player.id, cardIndex: i };
             }

            if (card.rank === requiredRank) {
                return { type: "play", playerId: player.id, cardIndex: i };
            }
        }
    }

    if (snapshot.hints > 0) {
        
        if (snapshot.hints === 8) {
            for (const target of snapshot.players) {
                if (target.id === player.id) continue;
                for (let i = 0; i < target.hand.length; i++) {
                    const c = target.hand[i];
                    const info = target.knownInfo[i];
                    if (!c || !info) continue;

                    if (c.rank === 5 && snapshot.fireworks[c.color] < 5 && info.rank !== 5) {
                        return { 
                            type: "hint", 
                            playerId: player.id, 
                            targetId: target.id, 
                            hint: { rank: 5 }
                        };
                    }
                }
            }
            
            const botIndex = snapshot.players.findIndex(p => p.id === player.id);
            const targetIndex = (botIndex + 1) % snapshot.players.length;
            const target = snapshot.players[targetIndex];
            
            if (target && target.hand.length > 0) {
                const firstCard = target.hand[0];
                if (firstCard) { 
                    return { type: "hint", playerId: player.id, targetId: target.id, hint: { color: firstCard.color } };
                }
            }
        }

        for (const target of snapshot.players) {
            if (target.id === player.id) continue;
            
            for (let i = 0; i < target.hand.length; i++) {
                const c = target.hand[i];
                const info = target.knownInfo[i];
                if (!c || !info) continue;
                
                if (c.rank === 1 && info.rank !== 1 && snapshot.fireworks[c.color] === 0) {
                    return { 
                        type: "hint", 
                        playerId: player.id, 
                        targetId: target.id, 
                        hint: { rank: 1 } 
                    };
                }
            }
        }

        for (const target of snapshot.players) {
            if (target.id === player.id) continue;
            
            for (let i = 0; i < target.hand.length; i++) {
                const c = target.hand[i];
                if (!c) continue;
                
                if (isCardPlayableFromSnapshot(snapshot, c)) { 
                    return { 
                        type: "hint", 
                        playerId: player.id, 
                        targetId: target.id, 
                        hint: { color: c.color } 
                    };
                }
            }
        }

        for (const target of snapshot.players) {
            if (target.id === player.id) continue;
            
            for (let i = 0; i < target.hand.length; i++) {
                const c = target.hand[i];
                const info = target.knownInfo[i];
                if (!c || !info) continue;
                
                if (c.rank === 5 && snapshot.fireworks[c.color] < 5) {
                    if (info.rank !== 5) {
                        return { 
                            type: "hint", 
                            playerId: player.id, 
                            targetId: target.id, 
                            hint: { rank: 5 }
                        };
                    }
                }
            }
        }
    } 

    let discardIndex = -1;
    for (let i = 0; i < player.hand.length; i++) {
        const info = player.knownInfo[i];
        
        if (!info.color && !info.rank) {
            discardIndex = i;
            break; 
        }
    }

    if (discardIndex !== -1) {
        return { type: "discard", playerId: player.id, cardIndex: discardIndex };
    }

    if (player.hand.length > 0) {
        
        for (let i = 0; i < player.hand.length; i++) {
            const info = player.knownInfo[i];
            
            if (info.rank !== 1 && info.rank !== 5) {
                 return { type: "discard", playerId: player.id, cardIndex: i };
            }
        }
    }
    
    return { type: "discard", playerId: player.id, cardIndex: 0 };
}