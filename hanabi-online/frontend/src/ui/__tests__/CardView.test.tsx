import React from 'react'; 
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardView from '../CardView'; 
import type { Color, Rank, KnownInfo, Card } from '../../types'; 

const MOCK_CARD: Card = { id: 'c1', color: 'red' as Color, rank: 3 as Rank };

describe('CardView Component', () => {
    const mockPlay = jest.fn();
    const mockDiscard = jest.fn();
    
    const getCardElement = (container: HTMLElement) => container.querySelector('div[style*="width: 65px"]') as HTMLElement;

    test('коректно відображає карту іншого гравця (показана карта)', () => {
        const { container } = render(
            <CardView 
                card={MOCK_CARD} 
                knownInfo={{}} 
                isMyCard={false} 
            />
        );
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(getCardElement(container)).toHaveStyle('background: #f87171');
    });

    test('коректно відображає замасковану карту (isMyCard = true)', () => {
        const { container } = render(
            <CardView 
                card={MOCK_CARD} 
                knownInfo={{}} 
                isMyCard={true} 
            />
        );
        expect(screen.getByText('?')).toBeInTheDocument();
        expect(getCardElement(container)).toHaveStyle('background: #444');
    });

    test('відображає підказку кольору та підсвічує рамку', () => {
        const knownInfo: KnownInfo = { color: 'red' as Color };
        const { container } = render(
            <CardView 
                card={MOCK_CARD} 
                knownInfo={knownInfo} 
                isMyCard={true} 
            />
        );
        expect(screen.getByText('Color: red')).toBeInTheDocument();
        expect(container.querySelector('div[style*="border-color: lime"]')).toBeInTheDocument();
    });

    test('відображає підказку рангу', () => {
        const knownInfo: KnownInfo = { rank: 3 as Rank };
        render(
            <CardView 
                card={MOCK_CARD} 
                knownInfo={knownInfo} 
                isMyCard={true} 
            />
        );
        expect(screen.getByText('Rank: 3')).toBeInTheDocument();
    });

    test('відображає not-інформацію', () => {
        const knownInfo: KnownInfo = { notColor: { blue: true } as any, notRank: { 1: true } as any };
        render(
            <CardView 
                card={MOCK_CARD} 
                knownInfo={knownInfo} 
                isMyCard={true} 
            />
        );
        expect(screen.getByText(/Not: blue/)).toBeInTheDocument();
        expect(screen.getByText(/Not: 1/)).toBeInTheDocument();
    });
    
    test('відображає кнопки дій (P/D) коли showActions=true', () => {
        render(
            <CardView 
                card={MOCK_CARD} 
                knownInfo={{}} 
                isMyCard={true} 
                onPlay={mockPlay} 
                onDiscard={mockDiscard} 
                showActions={true} 
            />
        );
        
        expect(screen.getByTitle('Play Card')).toBeInTheDocument();
        expect(screen.getByTitle('Discard Card (Regain Hint)')).toBeInTheDocument();
    });

    test('викликає onPlay та onDiscard при натисканні', () => {
        render(
            <CardView 
                card={MOCK_CARD} 
                knownInfo={{}} 
                isMyCard={true} 
                onPlay={mockPlay} 
                onDiscard={mockDiscard} 
                showActions={true} 
            />
        );
        
        fireEvent.click(screen.getByTitle('Play Card'));
        expect(mockPlay).toHaveBeenCalledTimes(1);
        
        fireEvent.click(screen.getByTitle('Discard Card (Regain Hint)'));
        expect(mockDiscard).toHaveBeenCalledTimes(1);
    });
});