import * as Tone from 'tone';

// Pentatonic harmonic scale for consecutive task completions
const PENTATONIC_SCALE = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'];

let consecutiveStreak = 0;
let lastCompletionTime = 0;
const STREAK_TIMEOUT_MS = 6500;

// Shared polyphonic acoustic synth instance (lazy initialized)
let kalimbaSynth = null;
let pebbleSynth = null;

const getKalimbaSynth = () => {
    if (!kalimbaSynth) {
        kalimbaSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.005, decay: 0.85, sustain: 0.05, release: 1.2 }
        }).toDestination();
        kalimbaSynth.volume.value = -8;
    }
    return kalimbaSynth;
};

const getPebbleSynth = () => {
    if (!pebbleSynth) {
        pebbleSynth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 2,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.25, sustain: 0.01, release: 0.4 }
        }).toDestination();
        pebbleSynth.volume.value = -12;
    }
    return pebbleSynth;
};

/**
 * Procedural Tibetan singing bowl harmonic chime
 * @param {number} fundamental - Fundamental frequency in Hz
 * @param {number} duration - Sustain duration in seconds
 */
export const playAcousticBowl = (fundamental = 216, duration = 3.5) => {
    try {
        Tone.start().then(() => {
            const now = Tone.now();
            const bowl = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine' },
                envelope: { attack: 0.06, decay: duration, sustain: 0, release: duration * 0.6 }
            }).toDestination();
            bowl.volume.value = -7;

            // Acoustic partials with subtle detune for authentic shimmer
            bowl.triggerAttackRelease(
                [fundamental, fundamental * 2.01, fundamental * 2.99, fundamental * 4.02],
                duration,
                now
            );
        }).catch(() => {});
    } catch {
        // Ignore audio context unlock errors
    }
};

/**
 * Play a progressive pentatonic chime on task completion.
 * Successive completions within 6.5s ascend the scale degrees!
 */
export const playTaskCompletionSound = (isMonolith = false) => {
    try {
        Tone.start().then(() => {
            const now = Tone.now();

            if (isMonolith) {
                // Sacred MIT finish: rich dual-bowl chord with celestial octave
                playAcousticBowl(216, 4.5);
                setTimeout(() => playAcousticBowl(324, 3.8), 120);
                consecutiveStreak = 0;
                return;
            }

            const currentTime = Date.now();
            if (currentTime - lastCompletionTime < STREAK_TIMEOUT_MS) {
                consecutiveStreak = (consecutiveStreak + 1) % PENTATONIC_SCALE.length;
            } else {
                consecutiveStreak = 0;
            }
            lastCompletionTime = currentTime;

            const note = PENTATONIC_SCALE[consecutiveStreak];
            const synth = getKalimbaSynth();

            // Play the primary note
            synth.triggerAttackRelease(note, '8n', now);

            // If user reaches highest scale degree (streak of 6), play triumphant harmony
            if (consecutiveStreak === PENTATONIC_SCALE.length - 1) {
                setTimeout(() => {
                    try {
                        const chordNow = Tone.now();
                        synth.triggerAttackRelease(['C5', 'G5', 'C6'], '4n', chordNow);
                    } catch {}
                }, 160);
            }
        }).catch(() => {});
    } catch {
        // Ignore audio context unlock errors
    }
};

/**
 * Play seed planting resonance: deep grounding bronze singing bowl
 */
export const playSeedPlantSound = () => {
    playAcousticBowl(108, 4.0); // Grounding 108 Hz
};

/**
 * Play subtle organic woodblock / pebble drop on task creation or drag-drop
 */
export const playPebbleDropSound = () => {
    try {
        Tone.start().then(() => {
            const now = Tone.now();
            const pebble = getPebbleSynth();
            pebble.triggerAttackRelease('G2', '16n', now);
        }).catch(() => {});
    } catch {}
};

/**
 * Play harmonic pentatonic progression on subtask check
 * Ascends through pentatonic scale, finishing with singing bowl on all completed
 */
export const playSubtaskProgressionSound = (completedCount = 1, totalCount = 1, isChecked = true) => {
    if (!isChecked) {
        playPebbleDropSound();
        return;
    }

    try {
        Tone.start().then(() => {
            const now = Tone.now();
            const synth = getKalimbaSynth();
            
            // Map completed count (1-based) to pentatonic scale
            const noteIndex = Math.max(0, (completedCount - 1) % PENTATONIC_SCALE.length);
            const note = PENTATONIC_SCALE[noteIndex];
            synth.triggerAttackRelease(note, '8n', now);

            // If this completes all subtasks, blossom with a resonant singing bowl
            if (completedCount >= totalCount && totalCount > 0) {
                setTimeout(() => {
                    playAcousticBowl(324, 3.2);
                }, 140);
            }
        }).catch(() => {});
    } catch {}
};

/**
 * Unified UI Sound Router
 */
export const playHarmonicUiSound = (effect, enabled = true, isMonolith = false, extraMeta = {}) => {
    if (!enabled) return;

    switch (effect) {
        case 'complete':
            playTaskCompletionSound(isMonolith);
            break;
        case 'subtask':
            playSubtaskProgressionSound(extraMeta.completedCount, extraMeta.totalCount, extraMeta.isChecked);
            break;
        case 'add':
        case 'drop':
            playPebbleDropSound();
            break;
        case 'plant_seed':
            playSeedPlantSound();
            break;
        case 'achievement':
            playAcousticBowl(288, 4.0);
            break;
        default:
            playPebbleDropSound();
            break;
    }
};
