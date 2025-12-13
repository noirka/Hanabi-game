import React from 'react';
import CardView from "./CardView"; 
import { type Card, type Player, type KnownInfo } from '../types';

interface HandViewProps {
    player: Player;
    isMe: boolean;
    onPlay?: (cardIndex: number) => void;
    onDiscard?: (cardIndex: number) => void;
    isMyTurn: boolean; 
}

export const HandView: React.FC<HandViewProps> = ({ player, isMe, onPlay, onDiscard, isMyTurn }) => {
    
    const showControls = isMe && isMyTurn && !!onPlay && !!onDiscard;

    const containerStyle: React.CSSProperties = isMe 
        ? { 
            padding: 10, 
            background: '#222',
          }
        : { 
            padding: 10, 
            borderRadius: 8, 
            background: '#222',
            marginBottom: 15,
            border: isMyTurn ? '3px solid gold' : '1px solid #444',
            boxShadow: isMyTurn ? '0 0 10px #ffcc00' : 'none',
            transition: 'all 0.3s ease',
          };

    const titleStyle: React.CSSProperties = {
        marginBottom: 10, 
        fontSize: 16, 
        color: isMyTurn ? 'lime' : '#f0f0f0',
        fontWeight: isMyTurn ? 'bold' : 'normal',
    };

    return (
        <div style={containerStyle}>
            <h3 style={titleStyle}>
                {player.name} {isMe && "(You)"} {player.isBot && "(Bot)"} 
                {isMyTurn && <span style={{fontSize: 12, color: 'lime', marginLeft: 10}}>(ХІД)</span>}
            </h3>
            
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
                {player.hand.map((card: Card, index: number) => {
                    const knownInfo: KnownInfo = player.knownInfo[index];
                    
                    return (
                        <CardView
                            key={card.id}
                            card={isMe ? undefined : card}
                            knownInfo={isMe ? knownInfo : undefined}
                            isMyCard={isMe} 
                            
                            onPlay={showControls ? () => onPlay!(index) : undefined}
                            onDiscard={showControls ? () => onDiscard!(index) : undefined}
                            showActions={showControls} 
                        />
                    );
                })}
            </div>
        </div>
    );
};