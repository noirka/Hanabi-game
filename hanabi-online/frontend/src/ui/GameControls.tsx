import React, { useState } from 'react';
import { type Player, type Move, type Color, type Rank, type HintValue } from '../types';

interface GameControlsProps {
    players: Player[];
    currentPlayer: Player;
    hints: number;
    onPerformMove: (move: Move) => void;
}

const COLOR_MAP: Record<Color, { bg: string, text: string }> = {
    red: { bg: '#f87171', text: '#450a0a' },
    blue: { bg: '#60a5fa', text: '#1e3a8a' },
    green: { bg: '#4ade80', text: '#064e3b' },
    yellow: { bg: '#facc15', text: '#78350f' },
    white: { bg: '#e5e7eb', text: '#374151' },
};

const ALL_RANKS: Rank[] = [1, 2, 3, 4, 5];
const ALL_COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'white'];

export const GameControls: React.FC<GameControlsProps> = ({ players, currentPlayer, hints, onPerformMove }) => {
    const [targetPlayerId, setTargetPlayerId] = useState<string>('');
    const [hintType, setHintType] = useState<'color' | 'rank' | null>(null);

    const isHintValid = targetPlayerId && hintType && hints > 0;

    const handleHint = (value: Color | Rank) => {
        if (!isHintValid) return;

        const hintPayload: HintValue = hintType === 'color' 
            ? { color: value as Color } 
            : { rank: value as Rank };
        
        const move: Move = {
            type: 'hint',
            playerId: currentPlayer.id,
            targetId: targetPlayerId,
            hint: hintPayload,
        };

        onPerformMove(move);
        setTargetPlayerId('');
        setHintType(null);
    };

    const isTargetReady = targetPlayerId !== '';

    return (
        <div style={{ borderTop: '1px dashed #333', marginTop: 15, paddingTop: 15 }}>
            <h4 style={{ color: '#fff', fontSize: 14, marginBottom: 10 }}>Give a Hint (Hints Left: {hints})</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                <select
                    onChange={(e) => setTargetPlayerId(e.target.value)}
                    value={targetPlayerId}
                    style={{ padding: 8, borderRadius: 4, background: '#333', color: '#fff', border: 'none' }}
                >
                    <option value="">-- Choose Target Player --</option>
                    {players
                        .filter(p => p.id !== currentPlayer.id)
                        .map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                </select>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button
                        onClick={() => setHintType('color')}
                        disabled={!isTargetReady || hints === 0}
                        style={{ padding: '8px 15px', background: hintType === 'color' ? '#5a67d8' : '#444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: isTargetReady ? 1 : 0.5 }}
                    >
                        Color Hint
                    </button>
                    <button
                        onClick={() => setHintType('rank')}
                        disabled={!isTargetReady || hints === 0}
                        style={{ padding: '8px 15px', background: hintType === 'rank' ? '#5a67d8' : '#444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: isTargetReady ? 1 : 0.5 }}
                    >
                        Rank Hint
                    </button>
                </div>

                {(hintType === 'color' && isTargetReady) && (
                    <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                        {ALL_COLORS.map(color => {
                            const styles = COLOR_MAP[color];
                            return (
                                <button
                                    key={color}
                                    onClick={() => handleHint(color)}
                                    disabled={!isHintValid}
                                    style={{
                                        padding: '5px 10px',
                                        background: styles.bg,
                                        color: styles.text,
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        opacity: isHintValid ? 1 : 0.5
                                    }}
                                >
                                    {color.charAt(0).toUpperCase()}
                                </button>
                            );
                        })}
                    </div>
                )}

                {(hintType === 'rank' && isTargetReady) && (
                    <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                        {ALL_RANKS.map(rank => (
                            <button
                                key={rank}
                                onClick={() => handleHint(rank)}
                                disabled={!isHintValid}
                                style={{
                                    padding: '5px 10px',
                                    background: '#2d3748',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    opacity: isHintValid ? 1 : 0.5
                                }}
                            >
                                {rank}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};