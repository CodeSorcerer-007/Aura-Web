import { useEffect, useState, useCallback, useMemo } from 'react';
import * as Tone from 'tone';
import { playAcousticBowl } from './useSoundEffects';

export const playTibetanBowl = (freq = 216, duration = 3.5) => {
    playAcousticBowl(freq, duration);
};

export const ATMOSPHERE_OPTIONS = [
    { id: 'off', label: 'Off', icon: 'VolumeX' },
    { id: 'rain', label: 'Rain', icon: 'CloudRain' },
    { id: 'ocean', label: 'Ocean Waves', icon: 'Waves' },
    { id: 'wind', label: 'Forest Wind', icon: 'Wind' },
    { id: 'brown', label: 'Brown Noise', icon: 'Volume2' },
    { id: 'pink', label: 'Pink Noise', icon: 'Volume2' },
    { id: 'white', label: 'White Noise', icon: 'Volume2' },
];

export const FREQUENCY_OPTIONS = [
    { id: 'off', label: 'Off', icon: 'VolumeX' },
    { id: 'solfeggio_432', label: '432 Hz Alpha', icon: 'Radio' },
    { id: 'solfeggio_528', label: '528 Hz Miracle', icon: 'Zap' },
    { id: 'waves_theta', label: 'Theta (6Hz)', icon: 'Sparkles' },
    { id: 'waves_alpha', label: 'Alpha (10Hz)', icon: 'Sparkles' },
    { id: 'chimes_procedural', label: 'Tibetan Chimes', icon: 'Bell' },
];

export const SOUND_PRESETS = [
    { id: 'deep_focus', name: 'Deep Focus', atmosphere: 'rain', frequency: 'solfeggio_432' },
    { id: 'ocean_theta', name: 'Ocean Theta', atmosphere: 'ocean', frequency: 'waves_theta' },
    { id: 'forest_zen', name: 'Forest Zen', atmosphere: 'wind', frequency: 'chimes_procedural' },
    { id: 'transformation', name: '528 Hz Renewal', atmosphere: 'off', frequency: 'solfeggio_528' },
];

export const SLEEP_TIMER_OPTIONS = [
    { id: 'off', label: 'Off' },
    { id: 15, label: '15m' },
    { id: 25, label: '25m' },
    { id: 50, label: '50m' },
    { id: 60, label: '60m' }
];

// --- Persistent Singleton Audio Engine & Autoplay Guard ---

let masterGain = null;
let atmosphereGain = null;
let frequencyGain = null;
let atmosphereNodes = null;
let frequencyNodes = null;
let chimesInterval = null;
let sleepInterval = null;
let userGestureListenerActive = false;

const getIsContextSuspended = () => {
    try {
        return Tone.getContext().state === 'suspended';
    } catch {
        return false;
    }
};

let sharedState = {
    atmosphereSound: 'off',
    frequencySound: 'off',
    masterVolume: 0.6,
    atmosphereVolume: 0.7,
    frequencyVolume: 0.7,
    sleepTimer: 'off',
    sleepSecondsLeft: 0,
    isSuspended: false,
};

const subscribers = new Set();
const notifySubscribers = () => {
    subscribers.forEach(cb => cb({ ...sharedState }));
};

const ensureBuses = () => {
    if (!masterGain) {
        masterGain = new Tone.Gain(sharedState.masterVolume).toDestination();
        atmosphereGain = new Tone.Gain(sharedState.atmosphereVolume).connect(masterGain);
        frequencyGain = new Tone.Gain(sharedState.frequencyVolume).connect(masterGain);
    }
};

const broadcastAmbientState = () => {
    const isPlaying = sharedState.atmosphereSound !== 'off' || sharedState.frequencySound !== 'off';
    const isSuspended = isPlaying && sharedState.isSuspended;
    try {
        window.dispatchEvent(new CustomEvent('aura-ambient-state-changed', {
            detail: {
                isPlaying,
                isSuspended,
                atmosphereSound: sharedState.atmosphereSound,
                frequencySound: sharedState.frequencySound
            }
        }));
    } catch {}
};

export const resumeAudioContext = async () => {
    try {
        await Tone.start();
        if (Tone.getContext().state === 'suspended') {
            await Tone.getContext().rawContext?.resume?.();
        }
        const isStillSusp = getIsContextSuspended();
        if (sharedState.isSuspended !== isStillSusp) {
            sharedState.isSuspended = isStillSusp;
            notifySubscribers();
            broadcastAmbientState();
        }
        return !isStillSusp;
    } catch (e) {
        console.warn('Audio resume attempt:', e);
        return false;
    }
};

// Autoplay Guard: Auto-resume Web Audio on first user interaction if active but suspended
const attachUserGestureUnlock = () => {
    if (userGestureListenerActive) return;
    userGestureListenerActive = true;

    const unlock = async () => {
        userGestureListenerActive = false;
        window.removeEventListener('pointerdown', unlock, { capture: true });
        window.removeEventListener('keydown', unlock, { capture: true });
        window.removeEventListener('touchstart', unlock, { capture: true });
        await resumeAudioContext();
    };

    window.addEventListener('pointerdown', unlock, { once: true, capture: true });
    window.addEventListener('keydown', unlock, { once: true, capture: true });
    window.addEventListener('touchstart', unlock, { once: true, capture: true });
};

// Monitor Tone raw context state transitions (e.g., auto-suspension, tab sleep)
try {
    const rawCtx = Tone.getContext().rawContext;
    if (rawCtx) {
        rawCtx.addEventListener?.('statechange', () => {
            const isSusp = getIsContextSuspended();
            if (sharedState.isSuspended !== isSusp) {
                sharedState.isSuspended = isSusp;
                if (isSusp && (sharedState.atmosphereSound !== 'off' || sharedState.frequencySound !== 'off')) {
                    attachUserGestureUnlock();
                }
                notifySubscribers();
                broadcastAmbientState();
            }
        });
    }
} catch {}

const cleanupAtmosphereNodes = () => {
    if (atmosphereNodes) {
        try {
            if (atmosphereNodes.stop) atmosphereNodes.stop();
            if (atmosphereNodes.dispose) atmosphereNodes.dispose();
        } catch (e) {
            console.error("Atmosphere cleanup error:", e);
        }
        atmosphereNodes = null;
    }
};

const cleanupFrequencyNodes = () => {
    if (chimesInterval) {
        clearInterval(chimesInterval);
        chimesInterval = null;
    }
    if (frequencyNodes) {
        try {
            if (frequencyNodes.stop) frequencyNodes.stop();
            if (frequencyNodes.dispose) frequencyNodes.dispose();
        } catch (e) {
            console.error("Frequency cleanup error:", e);
        }
        frequencyNodes = null;
    }
};

const rebuildAtmosphere = () => {
    cleanupAtmosphereNodes();
    if (sharedState.atmosphereSound === 'off') return;

    ensureBuses();
    const dest = atmosphereGain;
    const type = sharedState.atmosphereSound;

    try {
        if (type === 'pink' || type === 'brown' || type === 'white') {
            const noise = new Tone.Noise(type).connect(dest);
            noise.volume.value = -10;
            atmosphereNodes = {
                start: () => noise.start(),
                stop: () => noise.stop(),
                dispose: () => noise.dispose()
            };
        } else if (type === 'rain') {
            const noise = new Tone.Noise('pink');
            const filter = new Tone.Filter({ type: 'lowpass', frequency: 1200, rolloff: -24 });
            noise.connect(filter);
            filter.connect(dest);
            atmosphereNodes = {
                start: () => noise.start(),
                stop: () => noise.stop(),
                dispose: () => { noise.dispose(); filter.dispose(); }
            };
        } else if (type === 'ocean') {
            const noise = new Tone.Noise('brown');
            const filter = new Tone.Filter({ type: 'lowpass', frequency: 300, rolloff: -12 });
            const lfo = new Tone.LFO({ frequency: 0.1, min: 150, max: 800 });
            lfo.connect(filter.frequency);
            noise.connect(filter);
            filter.connect(dest);
            atmosphereNodes = {
                start: () => { noise.start(); lfo.start(); },
                stop: () => { noise.stop(); lfo.stop(); },
                dispose: () => { noise.dispose(); filter.dispose(); lfo.dispose(); }
            };
        } else if (type === 'wind') {
            const noise = new Tone.Noise('pink');
            const filter = new Tone.Filter({ type: 'bandpass', frequency: 500, Q: 1.5 });
            const lfo = new Tone.LFO({ frequency: 0.15, min: 200, max: 700 });
            lfo.connect(filter.frequency);
            noise.connect(filter);
            filter.connect(dest);
            atmosphereNodes = {
                start: () => { noise.start(); lfo.start(); },
                stop: () => { noise.stop(); lfo.stop(); },
                dispose: () => { noise.dispose(); filter.dispose(); lfo.dispose(); }
            };
        }

        if (atmosphereNodes) {
            atmosphereNodes.start?.();
            const isSusp = getIsContextSuspended();
            sharedState.isSuspended = isSusp;
            if (isSusp) {
                attachUserGestureUnlock();
            }
        }
    } catch (err) {
        console.error('Atmosphere synthesis error:', err);
    }
};

const rebuildFrequency = () => {
    cleanupFrequencyNodes();
    if (sharedState.frequencySound === 'off') return;

    ensureBuses();
    const dest = frequencyGain;
    const type = sharedState.frequencySound;

    try {
        if (type === 'solfeggio_432') {
            const oscMain = new Tone.Oscillator(432, 'sine');
            const oscHarmonic = new Tone.Oscillator(432 + 8, 'sine');
            const pannerL = new Tone.Panner(-0.6);
            const pannerR = new Tone.Panner(0.6);
            oscMain.connect(pannerL);
            pannerL.connect(dest);
            oscHarmonic.connect(pannerR);
            pannerR.connect(dest);
            frequencyNodes = {
                start: () => { oscMain.start(); oscHarmonic.start(); },
                stop: () => { oscMain.stop(); oscHarmonic.stop(); },
                dispose: () => { oscMain.dispose(); oscHarmonic.dispose(); pannerL.dispose(); pannerR.dispose(); }
            };
        } else if (type === 'solfeggio_528') {
            const oscMain = new Tone.Oscillator(528, 'sine');
            const oscOvertone = new Tone.Oscillator(1056, 'sine');
            const gainOver = new Tone.Gain(0.25);
            oscMain.connect(dest);
            oscOvertone.connect(gainOver);
            gainOver.connect(dest);
            frequencyNodes = {
                start: () => { oscMain.start(); oscOvertone.start(); },
                stop: () => { oscMain.stop(); oscOvertone.stop(); },
                dispose: () => { oscMain.dispose(); oscOvertone.dispose(); gainOver.dispose(); }
            };
        } else if (type === 'waves_theta' || type === 'waves_alpha') {
            const baseFreq = 200;
            const offset = type === 'waves_theta' ? 6 : 10;
            const oscL = new Tone.Oscillator(baseFreq, 'sine');
            const oscR = new Tone.Oscillator(baseFreq + offset, 'sine');
            const pannerL = new Tone.Panner(-1);
            const pannerR = new Tone.Panner(1);
            oscL.connect(pannerL);
            pannerL.connect(dest);
            oscR.connect(pannerR);
            pannerR.connect(dest);
            frequencyNodes = {
                start: () => { oscL.start(); oscR.start(); },
                stop: () => { oscL.stop(); oscR.stop(); },
                dispose: () => { oscL.dispose(); oscR.dispose(); pannerL.dispose(); pannerR.dispose(); }
            };
        } else if (type === 'chimes_procedural') {
            const poly = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine' },
                envelope: { attack: 0.05, decay: 4.5, sustain: 0, release: 3 }
            }).connect(dest);
            poly.volume.value = -4;

            const notes = ['C4', 'Eb4', 'F4', 'G4', 'Bb4', 'C5', 'Eb5'];
            const playChime = () => {
                const note = notes[Math.floor(Math.random() * notes.length)];
                poly.triggerAttackRelease(note, 4.5);
            };
            const timeoutId = setTimeout(playChime, 1200);
            chimesInterval = setInterval(playChime, 24000);

            frequencyNodes = {
                start: () => {},
                stop: () => {
                    clearTimeout(timeoutId);
                    if (chimesInterval) clearInterval(chimesInterval);
                },
                dispose: () => {
                    clearTimeout(timeoutId);
                    if (chimesInterval) clearInterval(chimesInterval);
                    poly.dispose();
                }
            };
        }

        if (frequencyNodes) {
            frequencyNodes.start?.();
            const isSusp = getIsContextSuspended();
            sharedState.isSuspended = isSusp;
            if (isSusp) {
                attachUserGestureUnlock();
            }
        }
    } catch (err) {
        console.error('Frequency synthesis error:', err);
    }
};

const updateSleepTimer = (val) => {
    if (sleepInterval) {
        clearInterval(sleepInterval);
        sleepInterval = null;
    }
    sharedState.sleepTimer = val;

    if (val === 'off') {
        sharedState.sleepSecondsLeft = 0;
        notifySubscribers();
        return;
    }

    const durationSeconds = Number(val) * 60;
    sharedState.sleepSecondsLeft = durationSeconds;
    notifySubscribers();

    sleepInterval = setInterval(() => {
        if (sharedState.sleepSecondsLeft <= 1) {
            clearInterval(sleepInterval);
            sleepInterval = null;
            sharedState.sleepSecondsLeft = 0;
            sharedState.sleepTimer = 'off';
            sharedState.atmosphereSound = 'off';
            sharedState.frequencySound = 'off';
            cleanupAtmosphereNodes();
            cleanupFrequencyNodes();
            notifySubscribers();
            broadcastAmbientState();
            return;
        }
        sharedState.sleepSecondsLeft -= 1;
        notifySubscribers();
    }, 1000);
};

export const useAmbientSound = (_isActive = true) => {
    const [state, setState] = useState(() => ({ ...sharedState }));

    useEffect(() => {
        subscribers.add(setState);
        return () => {
            subscribers.delete(setState);
        };
    }, []);

    const isPlaying = state.atmosphereSound !== 'off' || state.frequencySound !== 'off';

    const formattedSleepTime = useMemo(() => {
        if (state.sleepSecondsLeft <= 0) return null;
        const mins = Math.floor(state.sleepSecondsLeft / 60);
        const secs = state.sleepSecondsLeft % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, [state.sleepSecondsLeft]);

    const setAtmosphereSound = useCallback((val) => {
        if (sharedState.atmosphereSound === val) return;
        sharedState.atmosphereSound = val;
        Tone.start().catch(() => {});
        rebuildAtmosphere();
        notifySubscribers();
        broadcastAmbientState();
    }, []);

    const setFrequencySound = useCallback((val) => {
        if (sharedState.frequencySound === val) return;
        sharedState.frequencySound = val;
        Tone.start().catch(() => {});
        rebuildFrequency();
        notifySubscribers();
        broadcastAmbientState();
    }, []);

    const setMasterVolume = useCallback((val) => {
        sharedState.masterVolume = val;
        ensureBuses();
        masterGain.gain.rampTo(val, 0.1);
        notifySubscribers();
    }, []);

    const setAtmosphereVolume = useCallback((val) => {
        sharedState.atmosphereVolume = val;
        ensureBuses();
        atmosphereGain.gain.rampTo(val, 0.1);
        notifySubscribers();
    }, []);

    const setFrequencyVolume = useCallback((val) => {
        sharedState.frequencyVolume = val;
        ensureBuses();
        frequencyGain.gain.rampTo(val, 0.1);
        notifySubscribers();
    }, []);

    const stopAll = useCallback(() => {
        sharedState.atmosphereSound = 'off';
        sharedState.frequencySound = 'off';
        cleanupAtmosphereNodes();
        cleanupFrequencyNodes();
        notifySubscribers();
        broadcastAmbientState();
    }, []);

    const applyPreset = useCallback((preset) => {
        sharedState.atmosphereSound = preset.atmosphere;
        sharedState.frequencySound = preset.frequency;
        Tone.start().catch(() => {});
        rebuildAtmosphere();
        rebuildFrequency();
        notifySubscribers();
        broadcastAmbientState();
    }, []);

    // Backward compatibility for single-channel callers (such as FocusView)
    const soundType = state.atmosphereSound !== 'off' ? state.atmosphereSound : state.frequencySound;
    const setSoundType = useCallback((type) => {
        const isFreq = FREQUENCY_OPTIONS.some(f => f.id === type);
        if (type === 'off') {
            stopAll();
        } else if (isFreq) {
            setFrequencySound(type);
        } else {
            setAtmosphereSound(type);
        }
    }, [setFrequencySound, setAtmosphereSound, stopAll]);

    const soundOptions = useMemo(() => [
        ...ATMOSPHERE_OPTIONS,
        ...FREQUENCY_OPTIONS.filter(f => f.id !== 'off')
    ], []);

    return {
        // Dual-track mixer properties
        atmosphereSound: state.atmosphereSound,
        setAtmosphereSound,
        frequencySound: state.frequencySound,
        setFrequencySound,
        atmosphereVolume: state.atmosphereVolume,
        setAtmosphereVolume,
        frequencyVolume: state.frequencyVolume,
        setFrequencyVolume,
        masterVolume: state.masterVolume,
        setMasterVolume,
        isPlaying,
        isSuspended: isPlaying && state.isSuspended,
        resumeAudio: resumeAudioContext,
        stopAll,
        applyPreset,
        ATMOSPHERE_OPTIONS,
        FREQUENCY_OPTIONS,
        SOUND_PRESETS,
        sleepTimer: state.sleepTimer,
        setSleepTimer: updateSleepTimer,
        sleepTimerOptions: SLEEP_TIMER_OPTIONS,
        formattedSleepTime,
        // Backward compatibility
        soundType,
        setSoundType,
        volume: state.masterVolume,
        setVolume: setMasterVolume,
        soundOptions
    };
};
