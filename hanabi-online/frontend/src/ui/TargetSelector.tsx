import React, { useState } from 'react';
import { type Color, type Rank } from '../types';

interface TargetSelectorProps {
    players: { name: string, index: number }[];
    onHint: (targetIndex: number, type: 'color' | 'rank', value: Color | Rank) => void;
    hintsLeft: number;
    disabled: boolean; 
}

const COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'white'];
const RANKS: Rank[] = [1, 2, 3, 4, 5];

export const TargetSelector: React.FC<TargetSelectorProps> = ({ players, onHint, hintsLeft, disabled }) => {
    const [targetIndex, setTargetIndex] = useState<number | null>(null);
    const [hintType, setHintType] = useState<'color' | 'rank' | null>(null);

    const isTargetSelected = targetIndex !== null;
    
    const isDisabled = disabled || hintsLeft === 0;

    const handleValueSelection = (value: Color | Rank) => {
        if (targetIndex !== null && hintType && !isDisabled) {
            onHint(targetIndex, hintType, value);
            setTargetIndex(null);
            setHintType(null);
        }
    };
    
    const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTargetIndex(Number(e.target.value));
        setHintType(null);
    };

    return (
        <div style={{ marginTop: 20, padding: 10, border: '1px solid #555', borderRadius: 8, opacity: isDisabled ? 0.6 : 1 }}>
            <h4 style={{ color: '#f0f0f0', marginBottom: 10 }}>-- Choose Target Player --</h4>

            <select 
                onChange={handleTargetChange} 
                value={targetIndex === null ? '' : targetIndex}
                disabled={isDisabled} 
                style={{ padding: 8, marginRight: 10, background: '#333', color: 'white', border: '1px solid #777', borderRadius: 4, cursor: isDisabled ? 'default' : 'pointer' }}
            >
                <option value="" disabled>Select Player</option>
                {players.map(p => (
                    <option key={p.index} value={p.index}>
                        {p.name}
                    </option>
                ))}
            </select>

            <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
                <button 
                    onClick={() => setHintType('color')}
                    disabled={!isTargetSelected || isDisabled} 
                    style={{ 
                        padding: '8px 15px', 
                        background: hintType === 'color' ? '#1e40af' : '#444', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: 4, 
                        cursor: (isTargetSelected && !isDisabled) ? 'pointer' : 'default'
                    }}
                >
                    Color Hint
                </button>
                <button 
                    onClick={() => setHintType('rank')}
                    disabled={!isTargetSelected || isDisabled} 
                    style={{ 
                        padding: '8px 15px', 
                        background: hintType === 'rank' ? '#1e40af' : '#444', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: 4, 
                        cursor: (isTargetSelected && !isDisabled) ? 'pointer' : 'default'
                    }}
                >
                    Rank Hint
                </button>
            </div>

            {hintType === 'color' && isTargetSelected && (
                <div style={{ marginTop: 15, display: 'flex', gap: 5 }}>
                    {COLORS.map(color => (
                        <button 
                            key={color} 
                            onClick={() => handleValueSelection(color)}
                            disabled={isDisabled} 
                            style={{ 
                                padding: '5px 10px', 
                                background: 'transparent',
                                border: `2px solid ${color}`,
                                color: color,
                                fontWeight: 'bold',
                                borderRadius: 4,
                                cursor: !isDisabled ? 'pointer' : 'default'
                            }}
                        >
                            {color.substring(0, 1).toUpperCase()}
                        </button>
                    ))}
                </div>
            )}
            
            {hintType === 'rank' && isTargetSelected && (
                <div style={{ marginTop: 15, display: 'flex', gap: 5 }}>
                    {RANKS.map(rank => (
                        <button 
                            key={rank} 
                            onClick={() => handleValueSelection(rank)}
                            disabled={isDisabled} 
                            style={{ 
                                padding: '5px 10px', 
                                background: '#333',
                                border: '2px solid #777',
                                color: 'white',
                                fontWeight: 'bold',
                                borderRadius: 4,
                                cursor: !isDisabled ? 'pointer' : 'default'
                            }}
                        >
                            {rank}
                        </button>
                    ))}
                </div>
            )}
            {isDisabled && hintsLeft === 0 && (
                 <p style={{ marginTop: 15, color: '#f44336' }}>Немає доступних підказок.</p>
            )}
        </div>
    );
};