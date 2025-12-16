import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameControls } from '../GameControls';
import { type Player, type Move } from '../../types';

const mockOnPerformMove = jest.fn();

const mockPlayer1: Player = { id: 'p1', name: 'Alice', isBot: false, hand: [], knownInfo: [] };
const mockPlayer2: Player = { id: 'p2', name: 'Bob', isBot: false, hand: [], knownInfo: [] };
const mockPlayer3: Player = { id: 'p3', name: 'Charlie', isBot: false, hand: [], knownInfo: [] };

const mockPlayers: Player[] = [mockPlayer1, mockPlayer2, mockPlayer3];

const defaultProps = {
    players: mockPlayers,
    currentPlayer: mockPlayer1, 
    hints: 8,
    onPerformMove: mockOnPerformMove,
};


describe('GameControls Component (Hint Logic)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders hint controls and shows current hint count', () => {
        render(<GameControls {...defaultProps} />);
        
        expect(screen.getByText('Give a Hint (Hints Left: 8)')).toBeDefined();
        
        expect(screen.getByRole('button', { name: 'Color Hint' })).toBeDefined();
        expect(screen.getByRole('button', { name: 'Rank Hint' })).toBeDefined();
    });

    test('only lists other players as potential targets', () => {
        render(<GameControls {...defaultProps} />);
        
        expect(screen.queryByText('Alice')).toBeNull(); 
        
        expect(screen.getByText('Bob')).toBeDefined();
        expect(screen.getByText('Charlie')).toBeDefined();
    });

    test('Color/Rank Hint buttons are initially disabled if no target player is selected', () => {
        render(<GameControls {...defaultProps} />);
        
        expect(screen.getByRole('button', { name: 'Color Hint' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Rank Hint' })).toBeDisabled();
    });

    test('Color/Rank Hint buttons are disabled when hints count is 0', () => {
        const propsZeroHints = { ...defaultProps, hints: 0 };
        render(<GameControls {...propsZeroHints} />);
        
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'p2' } });

        expect(screen.getByRole('button', { name: 'Color Hint' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Rank Hint' })).toBeDisabled();
    });


    test('choosing a target enables hint type buttons', () => {
        render(<GameControls {...defaultProps} />);
        
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'p2' } });
        
        expect(screen.getByRole('button', { name: 'Color Hint' })).not.toBeDisabled();
        expect(screen.getByRole('button', { name: 'Rank Hint' })).not.toBeDisabled();
    });
    
    test('selecting Color Hint displays color buttons, and clicking one calls onPerformMove', () => {
        render(<GameControls {...defaultProps} />);
        
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'p2' } });
        
        fireEvent.click(screen.getByRole('button', { name: 'Color Hint' }));
        
        expect(screen.getByRole('button', { name: 'R' })).toBeDefined(); 
        expect(screen.getByRole('button', { name: 'B' })).toBeDefined(); 
        
        fireEvent.click(screen.getByRole('button', { name: 'R' }));
        
        expect(mockOnPerformMove).toHaveBeenCalledWith({
            type: 'hint',
            playerId: 'p1', 
            targetId: 'p2', 
            hint: { color: 'red' },
        } as Move);
        
        expect(screen.queryByRole('button', { name: 'R' })).toBeNull();
    });

    test('selecting Rank Hint displays rank buttons, and clicking one calls onPerformMove', () => {
        render(<GameControls {...defaultProps} />);
        
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'p3' } });
        
        fireEvent.click(screen.getByRole('button', { name: 'Rank Hint' }));
        
        expect(screen.getByRole('button', { name: '3' })).toBeDefined();
        expect(screen.getByRole('button', { name: '5' })).toBeDefined();
        
        fireEvent.click(screen.getByRole('button', { name: '4' }));
        
        expect(mockOnPerformMove).toHaveBeenCalledWith({
            type: 'hint',
            playerId: 'p1',
            targetId: 'p3',
            hint: { rank: 4 },
        } as Move);
        
        expect(screen.queryByRole('button', { name: '4' })).toBeNull();
    });
});