import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FireworksView } from '../FireworksView'; 
import type { Color, Rank } from '../../types'; 

const MOCK_FIREWORKS: Record<Color, Rank> = {
    red: 5 as Rank, 
    blue: 3 as Rank, 
    green: 0 as Rank, 
    yellow: 1 as Rank,
    white: 0 as Rank,
};

describe('FireworksView Component', () => {
    
    const getFireworkByColor = (color: string) => screen.getByTitle(new RegExp(`${color}.*stack`, 'i'));

    test('коректно відображає ранг для всіх стосів', () => {
        render(<FireworksView fireworks={MOCK_FIREWORKS} />);
        
        expect(getFireworkByColor('Red')).toHaveTextContent('5');
        expect(getFireworkByColor('Blue')).toHaveTextContent('3');
        expect(getFireworkByColor('Green')).toHaveTextContent('0');
        expect(getFireworkByColor('Yellow')).toHaveTextContent('1');
    });

    test('завершений стос (Rank 5) має спеціальне підсвічування (box-shadow)', () => {
        render(<FireworksView fireworks={MOCK_FIREWORKS} />);
        
        const redFirework = getFireworkByColor('Red');
        const blueFirework = getFireworkByColor('Blue');
        
        expect(redFirework).toHaveStyle('box-shadow: 0 0 15px 5px #e3342f');
        expect(blueFirework).toHaveStyle('box-shadow: 0 0 10px #3490dc88'); 
    });

    test('кожен стос має правильний колір рамки', () => {
        render(<FireworksView fireworks={MOCK_FIREWORKS} />);
        
        expect(getFireworkByColor('Red')).toHaveStyle('border: 3px solid #e3342f');
        expect(getFireworkByColor('Blue')).toHaveStyle('border: 3px solid #3490dc');
    });
});