import React from 'react';
import { type Card, type PlaceholderColor, type KnownInfo } from '../types';

interface CardViewProps {
    card?: Card; 
    knownInfo?: KnownInfo;
    isMyCard: boolean; 
    onPlay?: () => void; 
    onDiscard?: () => void; 
    showActions?: boolean;
}

const COLOR_STYLES: Record<PlaceholderColor, string> = { 
    red: "#f87171",
    blue: "#60a5fa",
    green: "#4ade80",
    yellow: "#facc15",
    white: "#e5e7eb", 
    placeholder: "#444", 
};

const TEXT_COLOR_MAP: Record<PlaceholderColor, string> = { 
    yellow: "#333", 
    white: "#333",
    red: "white",
    blue: "white",
    green: "white",
    placeholder: "#bbb", 
};

const CardView: React.FC<CardViewProps> = ({ card, knownInfo, isMyCard, onPlay, onDiscard, showActions }) => {
    
    const isHidden = !card || isMyCard;

    const effectiveColor: PlaceholderColor = isHidden 
        ? 'placeholder' 
        : (card!.color as PlaceholderColor);

    const displayColor = COLOR_STYLES[effectiveColor];
    const displayRank = isHidden ? '?' : card!.rank;
    
    const textColor = TEXT_COLOR_MAP[effectiveColor];


    const knownColor = knownInfo?.color;
    const knownRank = knownInfo?.rank;

    const cardStyle: React.CSSProperties = {
        width: 65,
        height: 85,
        borderRadius: 8,
        margin: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 5,
        fontSize: 24,
        fontWeight: 'bold',
        cursor: 'default',
        
        background: displayColor,
        border: `3px solid ${isHidden ? '#555' : displayColor}`, 
        
        color: textColor, 
        boxShadow: `0 4px 6px rgba(0, 0, 0, 0.3)`,
        transition: 'transform 0.1s',
        position: 'relative',
        marginBottom: showActions ? 40 : 5, 
    };

    const infoStyle: React.CSSProperties = {
        fontSize: 10,
        fontWeight: 'normal',
        width: '100%',
        textAlign: 'center',
        padding: '2px 0',
        background: 'rgba(0, 0, 0, 0.3)',
        color: 'white',
        borderRadius: 3,
        marginBottom: 2,
    };
    
    const knownHighlightStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        border: '3px solid',
        borderRadius: 8,
        borderColor: knownColor || knownRank ? 'lime' : 'transparent',
        boxShadow: knownColor || knownRank ? '0 0 10px lime' : 'none',
        pointerEvents: 'none',
    };


    const renderKnownInfo = () => {
        if (!isMyCard) return null;
        
        const hints: string[] = [];
        
        if (knownColor) {
            hints.push(`Color: ${knownColor}`);
        } else {
            const notColors = Object.keys(knownInfo?.notColor || {});
            if (notColors.length > 0) hints.push(`Not: ${notColors.join(', ')}`);
        }

        if (knownRank) {
            hints.push(`Rank: ${knownRank}`);
        } else {
            const notRanks = Object.keys(knownInfo?.notRank || {});
            if (notRanks.length > 0) hints.push(`Not: ${notRanks.join(', ')}`);
        }
        
        return (
            <div style={{ position: 'absolute', top: -10, width: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                 {hints.map((hint, index) => (
                    <div key={index} style={{ 
                        fontSize: 8, 
                        background: '#1e40af', 
                        color: 'white', 
                        borderRadius: 3, 
                        padding: '1px 3px', 
                        marginBottom: 1, 
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        fontWeight: 'normal',
                    }}>
                        {hint}
                    </div>
                ))}
            </div>
        );
    }
    
    const colorText = isMyCard && !knownColor ? 'Color?' : knownColor;
    const rankText = isMyCard && !knownRank ? 'Rank?' : knownRank;


    const actionButtonStyle: React.CSSProperties = {
        fontSize: 10, 
        padding: '3px 0px', 
        margin: '0 1px',
        borderRadius: 3,
        cursor: showActions ? 'pointer' : 'default', 
        border: 'none',
        fontWeight: 'bold', 
        width: '50%',
        textTransform: 'uppercase',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div 
                style={cardStyle} 
            >
                <div style={knownHighlightStyle}></div>
                {renderKnownInfo()}
                
                <div style={{
                    ...infoStyle, 
                    opacity: isMyCard && !knownColor ? 1 : (knownColor ? 1 : 0) 
                }}>
                    {colorText}
                </div>

                <span style={{ fontSize: 36, lineHeight: 1 }}>{displayRank}</span>

                <div style={{
                    ...infoStyle, 
                    opacity: isMyCard && !knownRank ? 1 : (knownRank ? 1 : 0)
                }}>
                    {rankText}
                </div>
            </div>

            {showActions && onPlay && onDiscard && (
                <div style={{ 
                    position: 'absolute', 
                    bottom: 5, 
                    left: 5, 
                    right: 5, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    height: 25, 
                }}>
                    <button 
                        onClick={onPlay} 
                        disabled={!showActions} 
                        style={{...actionButtonStyle, background: '#4CAF50', color: 'white'}}
                        title="Play Card"
                    >
                        P
                    </button>
                    <button 
                        onClick={onDiscard} 
                        disabled={!showActions} 
                        style={{...actionButtonStyle, background: '#f44336', color: 'white'}}
                        title="Discard Card (Regain Hint)"
                    >
                        D
                    </button>
                </div>
            )}
        </div>
    );
};

export default CardView;