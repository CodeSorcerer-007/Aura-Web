import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsModal } from '../src/components/modals/SettingsModal';

describe('SettingsModal', () => {
    const mockThemes = [
        { id: 'latte', name: 'Latte', bg: 'bg-[#faf8f5]', text: 'text-[#44403c]' },
        { id: 'nord', name: 'Nord Frost', bg: 'bg-[#2e3440]', text: 'text-[#eceff4]' }
    ];

    const mockSnapshots = [
        { id: 'snap-1', date: '2026-09-19', taskCount: 8 }
    ];

    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        theme: 'nord',
        setTheme: vi.fn(),
        customCategories: {},
        onUpdateCustomCategories: vi.fn(),
        onOpenThemeCreator: vi.fn(),
        allThemes: mockThemes,
        shutdownTime: '18:00',
        onSetShutdownTime: vi.fn(),
        soundEffectsEnabled: true,
        onSetSoundEffectsEnabled: vi.fn(),
        onOpenArchive: vi.fn(),
        autoArchiveEnabled: true,
        onSetAutoArchiveEnabled: vi.fn(),
        onExport: vi.fn(),
        onTriggerImport: vi.fn(),
        notificationsEnabled: true,
        onSetNotificationsEnabled: vi.fn(),
        onTestShutdownReminder: vi.fn(),
        onSaveSafetyVault: vi.fn(),
        onRestoreSnapshot: vi.fn(),
        getRollingSnapshots: () => mockSnapshots
    };

    it('returns null when isOpen is false', () => {
        const { container } = render(<SettingsModal {...defaultProps} isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders theme choices and calls setTheme on click', () => {
        const setTheme = vi.fn();
        render(<SettingsModal {...defaultProps} setTheme={setTheme} />);

        const latteBtn = screen.getByText('Latte');
        expect(latteBtn).toBeDefined();

        fireEvent.click(latteBtn);
        expect(setTheme).toHaveBeenCalledWith('latte');
    });

    it('renders DataVaultHealthWidget with offline validation indicator', () => {
        render(<SettingsModal {...defaultProps} />);

        expect(screen.getByText(/Air-Gapped Vault Integrity/i)).toBeDefined();
        expect(screen.getAllByText(/100% Offline/i).length).toBeGreaterThanOrEqual(1);
    });

    it('toggles rolling snapshots history on click', () => {
        render(<SettingsModal {...defaultProps} />);

        const viewHistoryBtn = screen.getByText(/View History/i);
        fireEvent.click(viewHistoryBtn);

        expect(screen.getByText('2026-09-19')).toBeDefined();
        expect(screen.getByText('(8 tasks)')).toBeDefined();
    });

    it('triggers export and import callbacks', () => {
        const onExport = vi.fn();
        const onTriggerImport = vi.fn();
        render(<SettingsModal {...defaultProps} onExport={onExport} onTriggerImport={onTriggerImport} />);

        fireEvent.click(screen.getByText(/Export/i));
        expect(onExport).toHaveBeenCalled();

        fireEvent.click(screen.getByText(/Import/i));
        expect(onTriggerImport).toHaveBeenCalled();
    });
});
