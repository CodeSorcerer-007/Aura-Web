import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CaptureInput } from '../src/components/common/CaptureInput';

describe('CaptureInput', () => {
    it('renders input field with placeholder', () => {
        render(<CaptureInput onAddTask={vi.fn()} onOpenBrainSweep={vi.fn()} allTags={['deepwork']} />);
        const input = screen.getByPlaceholderText(/Capture a thought/i);
        expect(input).toBeDefined();
    });

    it('submits task when submitting the form', () => {
        const onAddTask = vi.fn();
        render(<CaptureInput onAddTask={onAddTask} onOpenBrainSweep={vi.fn()} allTags={[]} />);
        const input = screen.getByPlaceholderText(/Capture a thought/i);

        fireEvent.change(input, { target: { value: 'Write weekly newsletter #Work' } });
        const submitBtn = screen.getByLabelText('Add task');
        fireEvent.click(submitBtn);

        expect(onAddTask).toHaveBeenCalledWith('Write weekly newsletter #Work');
        expect(input.value).toBe('');
    });

    it('appends energy mode when selected', () => {
        const onAddTask = vi.fn();
        render(<CaptureInput onAddTask={onAddTask} onOpenBrainSweep={vi.fn()} allTags={[]} />);

        // Click on spark button
        const sparkBtn = screen.getByTitle(/Deep Focus \/ High Creative Spark/i);
        fireEvent.click(sparkBtn);

        const input = screen.getByPlaceholderText(/Capture a thought/i);
        fireEvent.change(input, { target: { value: 'Ship critical bug fix' } });
        
        const submitBtn = screen.getByLabelText('Add task');
        fireEvent.click(submitBtn);

        expect(onAddTask).toHaveBeenCalledWith('Ship critical bug fix ~spark');
    });

    it('opens Brain Sweep when clicking the Zen Sweep button', () => {
        const onOpenBrainSweep = vi.fn();
        render(<CaptureInput onAddTask={vi.fn()} onOpenBrainSweep={onOpenBrainSweep} allTags={[]} />);

        const sweepBtn = screen.getByLabelText(/Open Zen Brain Sweep multi-line dump/i);
        fireEvent.click(sweepBtn);

        expect(onOpenBrainSweep).toHaveBeenCalled();
    });
});
