import { describe, it, expect, vi } from 'vitest';

vi.mock('tone', () => ({
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
        constructor() { this.type = 'pink'; }
        start() { return this; }
        stop() { return this; }
        connect() { return this; }
    },
    Filter: class {
        constructor() { this.frequency = { value: 1000, rampTo: vi.fn() }; }
        connect() { return this; }
        toDestination() { return this; }
    },
    Oscillator: class {
        constructor() { this.frequency = { value: 432, rampTo: vi.fn() }; }
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
}));

import {
    ATMOSPHERE_OPTIONS,
    INTERVAL_BELL_OPTIONS,
    SOUND_PRESETS,
    playTibetanBowl
} from '../src/hooks/useAmbientSound';

describe('Aura Soundscapes & Interval Chimes', () => {
    it('includes procedural campfire and summer meadow atmospheres', () => {
        const ids = ATMOSPHERE_OPTIONS.map(a => a.id);
        expect(ids).toContain('campfire');
        expect(ids).toContain('meadow');

        const campfire = ATMOSPHERE_OPTIONS.find(a => a.id === 'campfire');
        expect(campfire.label).toBe('Hearth Campfire');
        expect(campfire.icon).toBe('Flame');

        const meadow = ATMOSPHERE_OPTIONS.find(a => a.id === 'meadow');
        expect(meadow.label).toBe('Summer Meadow');
        expect(meadow.icon).toBe('Sun');
    });

    it('includes cozy_evening and night_meadow sound presets', () => {
        const cozy = SOUND_PRESETS.find(p => p.id === 'cozy_evening');
        expect(cozy).toBeDefined();
        expect(cozy.atmosphere).toBe('campfire');
        expect(cozy.frequency).toBe('waves_alpha');

        const nightMeadow = SOUND_PRESETS.find(p => p.id === 'night_meadow');
        expect(nightMeadow).toBeDefined();
        expect(nightMeadow.atmosphere).toBe('meadow');
        expect(nightMeadow.frequency).toBe('solfeggio_432');
    });

    it('configures periodic mindfulness interval bell intervals', () => {
        expect(INTERVAL_BELL_OPTIONS).toBeDefined();
        const ids = INTERVAL_BELL_OPTIONS.map(b => b.id);
        expect(ids).toContain('off');
        expect(ids).toContain(15);
        expect(ids).toContain(20);
        expect(ids).toContain(30);
        expect(ids).toContain(60);
    });

    it('plays Tibetan singing bowl chimes at harmonic frequencies', () => {
        // Standard fundamental
        expect(() => playTibetanBowl(216, 3.5)).not.toThrow();
        // 432Hz harmonic
        expect(() => playTibetanBowl(432, 4.0)).not.toThrow();
        // Default parameters
        expect(() => playTibetanBowl()).not.toThrow();
    });
});
