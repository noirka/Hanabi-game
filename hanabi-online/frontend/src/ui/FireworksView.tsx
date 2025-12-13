import React from 'react';
import { type Color, type Rank } from '../types';

interface FireworksViewProps {
    fireworks: Record<Color, Rank>;
}

const FIREWORK_STYLES: Record<Color, { border: string, text: string, shadow: string }> = {
    red: { border: '#e3342f', text: '#f9ac9a', shadow: '0 0 10px #e3342f88' },
    blue: { border: '#3490dc', text: '#9ac5fa', shadow: '0 0 10px #3490dc88' },
    green: { border: '#38c172', text: '#9cebaf', shadow: '0 0 10px #38c17288' },
    yellow: { border: '#ffed4a', text: '#fff3b0', shadow: '0 0 10px #ffed4a88' },
    white: { border: '#f8fafc', text: '#a0aec0', shadow: '0 0 10px #f8fafc88' },
};

const ALL_COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'white'];

export const FireworksView: React.FC<FireworksViewProps> = ({ fireworks }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {ALL_COLORS.map(color => {
                const rank = fireworks[color];
                const styles = FIREWORK_STYLES[color];
                
                const isComplete = rank === 5;
                
                return (
                    <div
                        key={color}
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#1e293b',
                            border: `3px solid ${styles.border}`,
                            boxShadow: isComplete ? `0 0 15px 5px ${styles.border}` : styles.shadow,
                            color: styles.text,
                            transition: 'all 0.3s ease',
                        }}
                        title={`${color.charAt(0).toUpperCase() + color.slice(1)} stack: ${rank}`}
                    >
                        <div style={{ fontSize: 12, textTransform: 'uppercase' }}>{color}</div>
                        <div style={{ fontSize: 32, fontWeight: 'bold' }}>{rank}</div>
                    </div>
                );
            })}
        </div>
    );
};