import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GroveView } from '../src/components/views/GroveView';

vi.mock('../../hooks/useSoundEffects', () => ({
    playHarmonicUiSound: vi.fn()
}));

describe('GroveView', () => {
    const mockGrove = [
        {
            id: 'tree-1',
            species: 'oak',
            plantedDate: '2026-09-01',
            growthPoints: 4,
            completedTasksCount: 12
        },
        {
            id: 'tree-2',
            species: 'cherry',
            plantedDate: '2026-09-10',
            growthPoints: 3,
            completedTasksCount: 8
        }
    ];

    const mockTasks = [
        { id: 't1', text: 'Launch feature', completed: true, win: 'Felt deep satisfaction shipping on time' },
        { id: 't2', text: 'Meditate', completed: true, win: 'Calm mind restored' }
    ];

    const defaultProps = {
        tasks: mockTasks,
        grove: mockGrove,
        goldenSeeds: 2,
        onPlantSeed: vi.fn(),
        allCategories: {},
        onOpenHarvestCard: vi.fn()
    };

    it('renders grove heading and botanical description', () => {
        render(<GroveView {...defaultProps} />);

        expect(screen.getByText('Your Grove')).toBeDefined();
        expect(screen.getByText(/A living botanical sanctuary/i)).toBeDefined();
    });

    it('renders golden seed panel with seed count and plant button', () => {
        render(<GroveView {...defaultProps} />);

        expect(screen.getByText(/Golden Seeds/i)).toBeDefined();
        expect(screen.getByText(/2 available/i)).toBeDefined();
    });

    it('calls onPlantSeed when plant seed button is clicked', () => {
        const onPlantSeed = vi.fn();
        render(<GroveView {...defaultProps} onPlantSeed={onPlantSeed} />);

        const plantBtn = screen.getByRole('button', { name: /Plant/i });
        fireEvent.click(plantBtn);

        expect(onPlantSeed).toHaveBeenCalledTimes(1);
    });

    it('displays accomplishment wins journal', () => {
        render(<GroveView {...defaultProps} />);

        expect(screen.getByText('Felt deep satisfaction shipping on time')).toBeDefined();
        expect(screen.getByText('Calm mind restored')).toBeDefined();
    });

    it('toggles rain ambiance weather', () => {
        render(<GroveView {...defaultProps} />);

        const rainBtn = screen.getByLabelText(/Toggle serene rain weather/i);
        expect(screen.getByText(/Rain Weather/i)).toBeDefined();

        fireEvent.click(rainBtn);
        expect(screen.getByText(/Rain Active/i)).toBeDefined();
    });
});
