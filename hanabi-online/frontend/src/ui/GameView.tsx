import React, { useState, useCallback } from 'react'; 
import { type Move, type GameSnapshot, type Color, type Rank, type Player, type Card } from '../types'; 
import { HandView } from './HandView';
import { DiscardPile } from './DiscardPile';
import { TargetSelector } from './TargetSelector'; 

interface UIState extends GameSnapshot {
    hints_left: number; 
    errors: number;
    discard_pile: Card[];
    log: string[];
    current_turn_index: number;
    status: 'in_progress' | 'game_over';
    score: number;
}

const mapSnapshotToGameState = (snapshot: GameSnapshot): UIState => {
    
    const score = Object.values(snapshot.fireworks).reduce((sum, rank) => sum + rank, 0);

    return {
        ...snapshot, 
        
        current_turn_index: snapshot.currentPlayerIndex,
        hints_left: snapshot.hints,
        errors: snapshot.strikes,
        discard_pile: snapshot.discard,
        log: snapshot.logLines,
        
        status: snapshot.finished ? 'game_over' : 'in_progress',
        score: score,
    } as UIState;
};


interface GameViewProps {
    game: GameSnapshot; 
    onMove: (move: Move) => Promise<void>; 
    myPlayerIndex: number;
}

const FIREWORK_COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'white'];

export const GameView: React.FC<GameViewProps> = ({ game, onMove, myPlayerIndex }) => {
    
    const [isProcessingMove, setIsProcessingMove] = useState(false); 
    
    const gameState = mapSnapshotToGameState(game);
    const myPlayerID = game.players[myPlayerIndex].id; 
    
    const isMyTurn = game.currentPlayerIndex === myPlayerIndex;
    const isMyTurnAndReady = isMyTurn && !isProcessingMove; 

    const executeMove = useCallback(async (move: Move) => {
        if (!isMyTurnAndReady) return;

        setIsProcessingMove(true); 

        try {
            await onMove(move);
        } catch (error) {
            console.error("Error executing move:", error);
        } finally {
            setIsProcessingMove(false); 
        }
    }, [isMyTurnAndReady, onMove]); 

    const handlePlayCard = (cardIndex: number) => {
        const move: Move = { type: 'play', cardIndex: cardIndex, playerId: myPlayerID }; 
        executeMove(move);
    };

    const handleDiscardCard = (cardIndex: number) => {
        const move: Move = { type: 'discard', cardIndex: cardIndex, playerId: myPlayerID };
        executeMove(move);
    };

    const handleHint = (targetIndex: number, type: 'color' | 'rank', value: Color | Rank) => {
        if (gameState.hints_left <= 0) return; 

        const targetPlayerID = game.players[targetIndex].id;
        
        const move: Move = {
            type: 'hint',
            playerId: myPlayerID,
            targetId: targetPlayerID,
            hint: type === 'color' ? { color: value as Color } : { rank: value as Rank }
        };
        
        executeMove(move);
    };

    const hintablePlayers = game.players
        .map((p: Player, index: number) => ({ name: p.name, index }))
        .filter(p => p.index !== myPlayerIndex);
    
    const myPlayer = game.players[myPlayerIndex];
    
    const sortedPlayers = game.players
        .map((p: Player, index: number) => ({ ...p, index }))
        .filter(p => p.index !== myPlayerIndex)
        .sort((a, b) => a.index - b.index); 
        
    const playerTurnContainerStyle: React.CSSProperties = {
        padding: 10, 
        borderRadius: 8, 
        background: '#222',
        marginBottom: 15,
        border: isMyTurn ? '3px solid gold' : '2px solid #5a67d8', 
        boxShadow: isMyTurn ? '0 0 10px #ffcc00' : 'none',
        transition: 'all 0.3s ease',
    };
    
    const turnHintsPart = `Turn: ${gameState.turn} | Hints: ${gameState.hints_left}`;
    const strikesValuePart = `Strikes: ${gameState.errors}`; 
    
    const deckPart = `Deck: ${game.deckCount}`; 
    
    const statusBarContainerStyle: React.CSSProperties = {
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: 20, 
        borderBottom: '1px solid #333', 
        paddingBottom: 10
    };
    
    const defaultStatusBarTextStyle: React.CSSProperties = {
        fontSize: 16,
        fontWeight: 'bold', 
        color: '#ccc',
        whiteSpace: 'nowrap', 
    };

    const strikesTextStyle: React.CSSProperties = {
        ...defaultStatusBarTextStyle, 
        color: gameState.errors > 0 ? '#f44336' : '#ccc', 
    };


    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20, background: '#1c1c1c', color: '#f0f0f0' }}>
            
            <h1 style={{ marginBottom: 15 }}>Hanabi — Online (Score: {gameState.score})</h1>
            
            <div style={statusBarContainerStyle}>
                
                <p style={{ ...defaultStatusBarTextStyle, display: 'flex', gap: 5 }}>
                    <span>{turnHintsPart}</span>
                    
                    <span>|</span>

                    <span style={strikesTextStyle}>{strikesValuePart}</span>

                    <span>|</span>
                    
                    <span>{deckPart}</span>
                </p>
                
                <button 
                    onClick={() => onMove({ type: 'restart', playerId: myPlayerID })} 
                    disabled={isProcessingMove} // 👈 БЛОКУЄМО КНОПКУ РЕСТАРТУ
                    style={{ padding: '5px 10px', background: '#555', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                >
                    Restart Game (New Game)
                </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 30 }}>
                {FIREWORK_COLORS.map(color => (
                    <div 
                        key={color} 
                        style={{ 
                            width: 80, 
                            height: 60, 
                            borderRadius: 6, 
                            background: '#333', 
                            border: `2px solid ${color}`,
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: color,
                            fontWeight: 'bold',
                            fontSize: 18,
                        }}
                    >
                        <span style={{ textTransform: 'capitalize' }}>{color}</span>
                        <span style={{ color: 'white', fontSize: 24 }}>{gameState.fireworks[color]}</span>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                
                <div style={{ flexGrow: 1, padding: 0, borderRadius: 10 }}>
                    
                    <div style={playerTurnContainerStyle}>
                        
                        <HandView 
                            player={myPlayer}
                            isMe={true}
                            onPlay={handlePlayCard}
                            onDiscard={handleDiscardCard}
                            isMyTurn={isMyTurnAndReady} 
                        />
                        
                        <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid #333' }}>
                            <h4 style={{ color: '#f0f0f0', marginBottom: 10 }}>Give a Hint (Hints Left: {gameState.hints_left})</h4>
                            
                            <TargetSelector 
                                players={hintablePlayers}
                                onHint={handleHint}
                                hintsLeft={gameState.hints_left}
                                disabled={!isMyTurnAndReady} 
                            />
                        </div>
                    </div>
                    
                    <div style={{ marginTop: 10 }}>
                         {sortedPlayers.map((player: Player & { index: number }) => (
                            <HandView 
                                key={player.id}
                                player={player}
                                isMe={false}
                                isMyTurn={player.index === gameState.current_turn_index} 
                            />
                        ))}
                    </div>

                </div>

                <div style={{ width: 300 }}>
                    
                    <DiscardPile discard={gameState.discard_pile} />

                    <div style={{ marginTop: 20, padding: 10, background: '#222', borderRadius: 6, height: 400, overflowY: 'auto' }}>
                        <h4 style={{ marginBottom: 10, color: '#f0f0f0' }}>Game Log</h4>
                        {[...gameState.log].reverse().map((entry: string, index: number) => {
                            const isStrike = entry.includes("STRIKE!");
                            const logStyle: React.CSSProperties = {
                                fontSize: 12, 
                                marginBottom: 5,
                                color: isStrike ? '#f44336' : '#f0f0f0', 
                                fontWeight: isStrike ? 'bold' : 'normal',
                            };
                            return (
                                <p key={index} style={logStyle}>{entry}</p>
                            );
                        })}
                    </div>

                </div>

            </div>
            
            {isProcessingMove && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <p style={{ color: 'white', fontSize: 24 }}>Processing Move...</p>
                </div>
            )}
        </div>
    );
};