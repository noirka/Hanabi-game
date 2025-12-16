import React from 'react'; 
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameView } from '../GameView';
import { type GameSnapshot, type Color, type Move, type Rank } from '../../types'; 

jest.mock('../HandView', () => ({
    HandView: jest.fn(({ isMe, isMyTurn, onPlay, onDiscard, player }) => (
        <div data-testid={`HandView-${player.id}`}>
            {isMe && <span>(My Hand)</span>}
            {isMyTurn && <span>(My Turn: Active)</span>}
            {isMe && onPlay && <button data-testid="play-btn" onClick={() => onPlay(0)}>Play</button>}
            {isMe && onDiscard && <button data-testid="discard-btn" onClick={() => onDiscard(0)}>Discard</button>}
        </div>
    )),
}));

jest.mock('../DiscardPile', () => ({
    DiscardPile: jest.fn(({ discard }) => (
        <div data-testid="DiscardPile">Discarded: {discard.length} cards</div>
    )),
}));

jest.mock('../TargetSelector', () => ({
    TargetSelector: jest.fn(({ onHint, hintsLeft, disabled }) => (
        <div data-testid="TargetSelector">
            <span data-testid="selector-hints">Hints: {hintsLeft}</span>
            <span data-testid="selector-disabled">{disabled ? 'Disabled' : 'Enabled'}</span>
            <button 
                data-testid="hint-btn" 
                onClick={() => onHint(1, 'color' as Color, 'red' as Color)}
                disabled={disabled}
            >
                Give Red Hint to Player 1
            </button>
        </div>
    )),
}));

const mockOnMove = jest.fn(async () => {});

const INITIAL_SCORE = 8;
const MAX_SCORE = 25;

const mockSnapshot: GameSnapshot = {
    players: [
        { id: 'p1', name: 'Alice', isBot: false, hand: [{id: 'c1', color: 'red', rank: 1 as Rank}], knownInfo: [{}]},
        { id: 'p2', name: 'Bob', isBot: false, hand: [{id: 'c2', color: 'blue', rank: 2 as Rank}], knownInfo: [{}]},
        { id: 'p3', name: 'Charlie', isBot: true, hand: [{id: 'c3', color: 'green', rank: 3 as Rank}], knownInfo: [{}]},
    ],
    deckCount: 30,
    discard: [{id: 'd1', color: 'white', rank: 1 as Rank}],
    fireworks: { red: 1 as Rank, blue: 1 as Rank, green: 2 as Rank, yellow: 1 as Rank, white: 3 as Rank }, 
    hints: 5,
    strikes: 1,
    turn: 15,
    currentPlayerIndex: 0,
    finished: false,
    logLines: ['Game started.', 'Alice played Red 1.'],
};

const defaultProps = {
    game: mockSnapshot,
    onMove: mockOnMove,
    myPlayerIndex: 0,
};


describe('GameView Component (Integration and State)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders global game status correctly (Score, Hints, Strikes, Deck)', () => {
        render(<GameView {...defaultProps} />);
        
        expect(screen.getByRole('heading', { name: `Hanabi — Online (Score: ${INITIAL_SCORE})` })).toBeDefined();
        
        expect(screen.getByText('Turn: 15 | Hints: 5')).toBeDefined();
        expect(screen.getByText('Strikes: 1')).toHaveStyle('color: #f44336'); 
        expect(screen.getByText('Deck: 30')).toBeDefined();

        expect(screen.getAllByText('1')).toHaveLength(3); 
        expect(screen.getByText('2')).toBeDefined(); 
        expect(screen.getByText('3')).toBeDefined(); 
    });

    test('renders all players HandView, DiscardPile, and TargetSelector', () => {
        render(<GameView {...defaultProps} />);

        expect(screen.getByTestId('HandView-p1')).toBeDefined(); 
        expect(screen.getByTestId('HandView-p2')).toBeDefined(); 
        expect(screen.getByTestId('HandView-p3')).toBeDefined(); 
        
        expect(screen.getByTestId('DiscardPile')).toHaveTextContent('Discarded: 1 cards');
        
        expect(screen.getByTestId('TargetSelector')).toBeDefined();
    });
    
    test('renders Game Log', () => {
        render(<GameView {...defaultProps} />);
        
        expect(screen.getByText('Game Log')).toBeDefined();
        expect(screen.getByText('Game started.')).toBeDefined();
        expect(screen.getByText('Alice played Red 1.')).toBeDefined();
    });

    test('correctly sets HandView props for the current player (Me)', () => {
        render(<GameView {...defaultProps} />);
        
        const myHandView = screen.getByTestId('HandView-p1');
        
        expect(myHandView).toHaveTextContent('(My Hand)');
        expect(myHandView).toHaveTextContent('(My Turn: Active)'); 
        expect(screen.getByTestId('play-btn')).toBeDefined();
        expect(screen.getByTestId('discard-btn')).toBeDefined();
        
        expect(screen.getByTestId('selector-disabled')).toHaveTextContent('Enabled');
    });

    test('correctly sets HandView props for other players', () => {
        render(<GameView {...defaultProps} />);
        
        const bobHandView = screen.getByTestId('HandView-p2');
        
        expect(bobHandView).not.toHaveTextContent('(My Hand)');
        expect(bobHandView).not.toHaveTextContent('(My Turn: Active)'); 
    });

    test('clicking Play button calls onMove with "play" move type and correct ID/Index', async () => {
        let resolveMockMove: (value: any) => void = () => {}; 
        
        const mockControlledOnMove: (move: Move) => Promise<void> = jest.fn(() => {
            return new Promise<void>(resolve => {
                resolveMockMove = resolve;
            });
        });

        render(<GameView {...defaultProps} onMove={mockControlledOnMove} />);
        
        await act(async () => {
            fireEvent.click(screen.getByTestId('play-btn'));
        });
        
        expect(mockControlledOnMove).toHaveBeenCalledWith({
            type: 'play',
            cardIndex: 0, 
            playerId: 'p1',
        });
        expect(screen.getByText('Processing Move...')).toBeDefined(); 
        
        await act(async () => {
            resolveMockMove({}); 
        });
        
        expect(screen.queryByText('Processing Move...')).toBeNull();
    });

    test('clicking Discard button calls onMove with "discard" move type and correct ID/Index', async () => {
        render(<GameView {...defaultProps} />);
        
        await act(async () => {
            fireEvent.click(screen.getByTestId('discard-btn'));
        });
        
        expect(mockOnMove).toHaveBeenCalledWith({
            type: 'discard',
            cardIndex: 0, 
            playerId: 'p1',
        });
    });

    test('TargetSelector hint action calls onMove with "hint" move type and correct payload', async () => {
        render(<GameView {...defaultProps} />);
        
        await act(async () => {
            fireEvent.click(screen.getByTestId('hint-btn'));
        });
        
        const expectedTargetPlayerID = mockSnapshot.players[1].id; 
        
        expect(mockOnMove).toHaveBeenCalledWith({
            type: 'hint',
            playerId: 'p1', 
            targetId: expectedTargetPlayerID, 
            hint: { color: 'red' },
        });
    });
    
    test('clicking Restart Game calls onMove with "restart" move type', async () => {
        render(<GameView {...defaultProps} />);
        
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Restart Game (New Game)' }));
        });
        
        expect(mockOnMove).toHaveBeenCalledWith({
            type: 'restart',
            playerId: 'p1',
        });
    });
    
    test('Disables HintSelector when hintsLeft is 0', () => {
        const mockSnapshotNoHints: GameSnapshot = {
            ...mockSnapshot,
            hints: 0,
        };

        render(<GameView {...defaultProps} game={mockSnapshotNoHints} />);

        expect(screen.getByTestId('selector-hints')).toHaveTextContent('Hints: 0');
        expect(screen.getByTestId('selector-disabled')).toHaveTextContent('Disabled');
        
        expect(screen.getByTestId('hint-btn')).toBeDisabled();
    });

    test('Renders "Game Over" screen when game is finished (Max Score)', () => {
        const mockSnapshotFinished: GameSnapshot = {
            ...mockSnapshot,
            finished: true,
            fireworks: { red: 5 as Rank, blue: 5 as Rank, green: 5 as Rank, yellow: 5 as Rank, white: 5 as Rank }, 
        };

        render(<GameView {...defaultProps} game={mockSnapshotFinished} />);

        expect(screen.getByText('Game Over!')).toBeDefined();
        
        expect(screen.getByRole('heading', { name: `Hanabi — Online (Final Score: ${MAX_SCORE})` })).toBeDefined();

        expect(screen.queryByTestId('play-btn')).toBeNull();
        expect(screen.queryByTestId('discard-btn')).toBeNull();
        
        expect(screen.getByRole('button', { name: 'Restart Game (New Game)' })).toBeEnabled();
    });
});