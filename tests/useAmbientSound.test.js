import { describe, it, expect, vi } from 'vitest';

vi.mock('tone', () => {
    return {
        getContext: () => ({
            state: 'running',
            rawContext: {},
            resume: vi.fn().mockResolvedValue()
        }),
        start: vi.fn().mockResolvedValue(),
        Gain: class {
            constructor() {
                this.gain = { value: 1, rampTo: vi.fn() };
            }
            connect() { return this; }
            disconnect() { return this; }
            toDestination() { return this; }
        },
        Noise: class {
            constructor() {
                this.type = 'pink';
            }
            start() { return this; }
            stop() { return this; }
            connect() { return this; }
        },
        Filter: class {
            constructor() {
                this.frequency = { value: 1000, rampTo: vi.fn() };
            }
            connect() { return this; }
            toDestination() { return this; }
        },
        Oscillator: class {
            constructor() {
                this.frequency = { value: 432, rampTo: vi.fn() };
            }
            start() { return this; }
            stop() { return this; }
            connect() { return this; }
        },
        LFO: class {
            start() { return this; }
            stop() { return this; }
            connect() { return this; }
        },
        FeedbackDelay: class {
            connect() { return this; }
            toDestination() { return this; }
        },
        Reverb: class {
            generate() { return Promise.resolve(); }
            connect() { return this; }
            toDestination() { return this; }
        },
        PolySynth: class {
            triggerAttackRelease() {}
            toDestination() { return this; }
        },
        Synth: class {
            triggerAttackRelease() {}
            toDestination() { return this; }
        }
    };
});

import {
    ATMOSPHERE_OPTIONS,
    FREQUENCY_OPTIONS,
    SOUND_PRESETS,
    SLEEP_TIMER_OPTIONS,
    playTibetanBowl
} from '../src/hooks/useAmbientSound';

describe('useAmbientSound options and presets', () => {
    it('defines valid atmosphere options with IDs and icons', () => {
        expect(ATMOSPHERE_OPTIONS.length).toBeGreaterThanOrEqual(5);
        const ids = ATMOSPHERE_OPTIONS.map(a => a.id);
        expect(ids).toContain('off');
        expect(ids).toContain('rain');
        expect(ids).toContain('ocean');
        expect(ids).toContain('wind');
    });

    it('defines solfeggio and brainwave frequency options', () => {
        const ids = FREQUENCY_OPTIONS.map(f => f.id);
        expect(ids).toContain('solfeggio_432');
        expect(ids).toContain('solfeggio_528');
        expect(ids).toContain('waves_theta');
    });

    it('defines crafted presets with matching atmosphere and frequency IDs', () => {
        const atmosIds = new Set(ATMOSPHERE_OPTIONS.map(a => a.id));
        const freqIds = new Set(FREQUENCY_OPTIONS.map(f => f.id));

        for (const preset of SOUND_PRESETS) {
            expect(preset.id).toBeDefined();
            expect(preset.name).toBeDefined();
            expect(atmosIds.has(preset.atmosphere)).toBe(true);
            expect(freqIds.has(preset.frequency)).toBe(true);
        }
    });

    it('defines sleep timer intervals including standard pomodoro spans', () => {
        const ids = SLEEP_TIMER_OPTIONS.map(s => s.id);
        expect(ids).toContain('off');
        expect(ids).toContain(25);
        expect(ids).toContain(50);
    });

    it('executes playTibetanBowl without crashing', () => {
        expect(() => playTibetanBowl(216, 1)).not.toThrow();
    });
});
