import React from 'react'; 
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HandView } from '../HandView'; 
import { type Card, type Player, type KnownInfo } from '../../types'; 


interface MockCardViewProps {
    card?: Card;
    knownInfo?: KnownInfo;
    isMyCard: boolean; 
    onPlay?: () => void;
    onDiscard?: () => void;
    showActions: boolean;
}

jest.mock('../CardView', () => ({
    __esModule: true, 
    default: ({ card, knownInfo, onPlay, onDiscard, showActions }: MockCardViewProps) => {
        const id = card ? card.id : knownInfo?.color || 'unknown';
        
        return (
            <div 
                data-testid={`card-view-${id}`} 
                onClick={() => { 
                    if (onPlay && onDiscard) {
                       onPlay();
                       onDiscard();
                    }
                }}
            >
                {showActions && <span>(Actionable)</span>}
            </div>
        );
    }
}));


describe('HandView Component Rendering and Interaction', () => {
    
    const mockCard1: Card = { id: 'c1', color: 'red', rank: 1 };
    const mockCard2: Card = { id: 'c2', color: 'blue', rank: 2 };
    
    const mockKnownInfo1: KnownInfo = { color: 'red' };
    const mockKnownInfo2: KnownInfo = {};

    const mockPlayer: Player = { 
        id: 'p1', 
        name: 'Alice', 
        isBot: false, 
        hand: [mockCard1, mockCard2], 
        knownInfo: [mockKnownInfo1, mockKnownInfo2] 
    };

    const mockOnPlay = jest.fn();
    const mockOnDiscard = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    test('renders player name and (You) label correctly', () => {
        render(<HandView player={mockPlayer} isMe={true} isMyTurn={false} />);
        expect(screen.getByText('Alice (You)')).toBeDefined(); 
    });
    
    test('renders turn indicator (ХІД) when it is my turn', () => {
        render(<HandView player={mockPlayer} isMe={true} isMyTurn={true} />);
        expect(screen.getByText('(ХІД)')).toBeDefined();
    });

    test('passes CARD data to CardView for ALLY hand (isMe=false)', () => {
        render(<HandView player={mockPlayer} isMe={false} isMyTurn={false} />);
        expect(screen.getByTestId('card-view-c1')).toBeDefined();
        expect(screen.getByTestId('card-view-c2')).toBeDefined();
    });

    test('passes knownInfo to CardView for OWN hand (isMe=true)', () => {
        render(<HandView player={mockPlayer} isMe={true} isMyTurn={false} />);
        expect(screen.getByTestId('card-view-red')).toBeDefined(); 
        expect(screen.getByTestId('card-view-unknown')).toBeDefined(); 
    });
    
    test('shows actions (onPlay/onDiscard) only when showControls is TRUE', () => {
        render(
            <HandView 
                player={mockPlayer} 
                isMe={true} 
                isMyTurn={true} 
                onPlay={mockOnPlay} 
                onDiscard={mockOnDiscard} 
            />
        );
        
        const actionableCards = screen.getAllByText('(Actionable)');
        expect(actionableCards).toHaveLength(2);
    });

    test('DOES NOT show actions when it is NOT my turn', () => {
        render(
            <HandView 
                player={mockPlayer} 
                isMe={true} 
                isMyTurn={false} 
                onPlay={mockOnPlay} 
                onDiscard={mockOnDiscard} 
            />
        );
        
        expect(screen.queryAllByText('(Actionable)')).toHaveLength(0);
    });
    
    test('clicking a card calls onPlay and onDiscard handlers with the correct index when controls are visible', () => {
        render(
            <HandView 
                player={mockPlayer} 
                isMe={true} 
                isMyTurn={true} 
                onPlay={mockOnPlay} 
                onDiscard={mockOnDiscard} 
            />
        );
        
        const secondCard = screen.getByTestId('card-view-unknown'); 
        fireEvent.click(secondCard); 

        expect(mockOnPlay).toHaveBeenCalledWith(1);
        expect(mockOnDiscard).toHaveBeenCalledWith(1);
    });
});