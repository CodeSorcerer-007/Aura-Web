import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
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

// Presets for single-click harmonic layering
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

export const useAmbientSound = (isActive = true) => {
    const [atmosphereSound, setAtmosphereSound] = useState('off');
    const [frequencySound, setFrequencySound] = useState('off');
    const [masterVolume, setMasterVolume] = useState(0.6); // 0 to 1
    const [atmosphereVolume, setAtmosphereVolume] = useState(0.7); // 0 to 1
    const [frequencyVolume, setFrequencyVolume] = useState(0.7); // 0 to 1
    const [sleepTimer, setSleepTimerState] = useState('off');
    const [sleepSecondsLeft, setSleepSecondsLeft] = useState(0);

    // Audio nodes refs
    const masterGainRef = useRef(null);
    const atmosphereGainRef = useRef(null);
    const frequencyGainRef = useRef(null);
    const atmosphereNodesRef = useRef(null);
    const frequencyNodesRef = useRef(null);
    const chimesIntervalRef = useRef(null);

    // Initialize master bus
    useEffect(() => {
        if (!masterGainRef.current) {
            masterGainRef.current = new Tone.Gain(masterVolume).toDestination();
            atmosphereGainRef.current = new Tone.Gain(atmosphereVolume).connect(masterGainRef.current);
            frequencyGainRef.current = new Tone.Gain(frequencyVolume).connect(masterGainRef.current);
        }

        return () => {
            if (masterGainRef.current) {
                masterGainRef.current.dispose();
                masterGainRef.current = null;
            }
            if (atmosphereGainRef.current) {
                atmosphereGainRef.current.dispose();
                atmosphereGainRef.current = null;
            }
            if (frequencyGainRef.current) {
                frequencyGainRef.current.dispose();
                frequencyGainRef.current = null;
            }
        };
    }, []);

    // Update Master Gain
    useEffect(() => {
        if (masterGainRef.current) {
            masterGainRef.current.gain.rampTo(masterVolume, 0.1);
        }
    }, [masterVolume]);

    // Update Atmosphere Gain
    useEffect(() => {
        if (atmosphereGainRef.current) {
            atmosphereGainRef.current.gain.rampTo(atmosphereVolume, 0.1);
        }
    }, [atmosphereVolume]);

    // Update Frequency Gain
    useEffect(() => {
        if (frequencyGainRef.current) {
            frequencyGainRef.current.gain.rampTo(frequencyVolume, 0.1);
        }
    }, [frequencyVolume]);

    // Cleanup Atmosphere Track
    const cleanupAtmosphere = useCallback(() => {
        if (atmosphereNodesRef.current) {
            try {
                if (atmosphereNodesRef.current.stop) atmosphereNodesRef.current.stop();
                if (atmosphereNodesRef.current.dispose) atmosphereNodesRef.current.dispose();
            } catch (e) {
                console.error("Atmosphere cleanup error:", e);
            }
            atmosphereNodesRef.current = null;
        }
    }, []);

    // Cleanup Frequency Track
    const cleanupFrequency = useCallback(() => {
        if (chimesIntervalRef.current) {
            clearInterval(chimesIntervalRef.current);
            chimesIntervalRef.current = null;
        }
        if (frequencyNodesRef.current) {
            try {
                if (frequencyNodesRef.current.stop) frequencyNodesRef.current.stop();
                if (frequencyNodesRef.current.dispose) frequencyNodesRef.current.dispose();
            } catch (e) {
                console.error("Frequency cleanup error:", e);
            }
            frequencyNodesRef.current = null;
        }
    }, []);

    // 1. Atmosphere Sound Engine
    useEffect(() => {
        cleanupAtmosphere();
        if (atmosphereSound === 'off' || !atmosphereGainRef.current) return;

        try {
            const dest = atmosphereGainRef.current;

            if (atmosphereSound === 'pink' || atmosphereSound === 'brown' || atmosphereSound === 'white') {
                const noise = new Tone.Noise(atmosphereSound).connect(dest);
                noise.volume.value = -10;
                atmosphereNodesRef.current = {
                    start: () => noise.start(),
                    stop: () => noise.stop(),
                    dispose: () => noise.dispose()
                };
            } else if (atmosphereSound === 'rain') {
                const noise = new Tone.Noise('pink');
                const filter = new Tone.Filter({ type: 'lowpass', frequency: 1200, rolloff: -24 });
                noise.connect(filter);
                filter.connect(dest);
                atmosphereNodesRef.current = {
                    start: () => noise.start(),
                    stop: () => noise.stop(),
                    dispose: () => { noise.dispose(); filter.dispose(); }
                };
            } else if (atmosphereSound === 'ocean') {
                const noise = new Tone.Noise('brown');
                const filter = new Tone.Filter({ type: 'lowpass', frequency: 300, rolloff: -12 });
                const lfo = new Tone.LFO({ frequency: 0.1, min: 150, max: 800 });
                lfo.connect(filter.frequency);
                noise.connect(filter);
                filter.connect(dest);
                atmosphereNodesRef.current = {
                    start: () => { noise.start(); lfo.start(); },
                    stop: () => { noise.stop(); lfo.stop(); },
                    dispose: () => { noise.dispose(); filter.dispose(); lfo.dispose(); }
                };
            } else if (atmosphereSound === 'wind') {
                const noise = new Tone.Noise('pink');
                const filter = new Tone.Filter({ type: 'bandpass', frequency: 500, Q: 1.5 });
                const lfo = new Tone.LFO({ frequency: 0.15, min: 200, max: 700 });
                lfo.connect(filter.frequency);
                noise.connect(filter);
                filter.connect(dest);
                atmosphereNodesRef.current = {
                    start: () => { noise.start(); lfo.start(); },
                    stop: () => { noise.stop(); lfo.stop(); },
                    dispose: () => { noise.dispose(); filter.dispose(); lfo.dispose(); }
                };
            }

            if (isActive && atmosphereNodesRef.current) {
                Tone.start().then(() => {
                    atmosphereNodesRef.current?.start?.();
                }).catch(() => {});
            }
        } catch (err) {
            console.error('Atmosphere synthesis error:', err);
        }

        return () => cleanupAtmosphere();
    }, [atmosphereSound, cleanupAtmosphere, isActive]);

    // 2. Frequency Sound Engine
    useEffect(() => {
        cleanupFrequency();
        if (frequencySound === 'off' || !frequencyGainRef.current) return;

        try {
            const dest = frequencyGainRef.current;

            if (frequencySound === 'solfeggio_432') {
                const oscMain = new Tone.Oscillator(432, 'sine');
                const oscHarmonic = new Tone.Oscillator(432 + 8, 'sine');
                const pannerL = new Tone.Panner(-0.6);
                const pannerR = new Tone.Panner(0.6);
                oscMain.connect(pannerL);
                pannerL.connect(dest);
                oscHarmonic.connect(pannerR);
                pannerR.connect(dest);
                frequencyNodesRef.current = {
                    start: () => { oscMain.start(); oscHarmonic.start(); },
                    stop: () => { oscMain.stop(); oscHarmonic.stop(); },
                    dispose: () => { oscMain.dispose(); oscHarmonic.dispose(); pannerL.dispose(); pannerR.dispose(); }
                };
            } else if (frequencySound === 'solfeggio_528') {
                const oscMain = new Tone.Oscillator(528, 'sine');
                const oscOvertone = new Tone.Oscillator(1056, 'sine');
                const gainOver = new Tone.Gain(0.25);
                oscMain.connect(dest);
                oscOvertone.connect(gainOver);
                gainOver.connect(dest);
                frequencyNodesRef.current = {
                    start: () => { oscMain.start(); oscOvertone.start(); },
                    stop: () => { oscMain.stop(); oscOvertone.stop(); },
                    dispose: () => { oscMain.dispose(); oscOvertone.dispose(); gainOver.dispose(); }
                };
            } else if (frequencySound === 'waves_theta' || frequencySound === 'waves_alpha') {
                const baseFreq = 200;
                const offset = frequencySound === 'waves_theta' ? 6 : 10;
                const oscL = new Tone.Oscillator(baseFreq, 'sine');
                const oscR = new Tone.Oscillator(baseFreq + offset, 'sine');
                const pannerL = new Tone.Panner(-1);
                const pannerR = new Tone.Panner(1);
                oscL.connect(pannerL);
                pannerL.connect(dest);
                oscR.connect(pannerR);
                pannerR.connect(dest);
                frequencyNodesRef.current = {
                    start: () => { oscL.start(); oscR.start(); },
                    stop: () => { oscL.stop(); oscR.stop(); },
                    dispose: () => { oscL.dispose(); oscR.dispose(); pannerL.dispose(); pannerR.dispose(); }
                };
            } else if (frequencySound === 'chimes_procedural') {
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
                chimesIntervalRef.current = setInterval(playChime, 24000);

                frequencyNodesRef.current = {
                    start: () => {},
                    stop: () => {
                        clearTimeout(timeoutId);
                        if (chimesIntervalRef.current) clearInterval(chimesIntervalRef.current);
                    },
                    dispose: () => {
                        clearTimeout(timeoutId);
                        if (chimesIntervalRef.current) clearInterval(chimesIntervalRef.current);
                        poly.dispose();
                    }
                };
            }

            if (isActive && frequencyNodesRef.current) {
                Tone.start().then(() => {
                    frequencyNodesRef.current?.start?.();
                }).catch(() => {});
            }
        } catch (err) {
            console.error('Frequency synthesis error:', err);
        }

        return () => cleanupFrequency();
    }, [frequencySound, cleanupFrequency, isActive]);

    // Sleep Timer countdown
    useEffect(() => {
        if (sleepTimer === 'off') {
            setSleepSecondsLeft(0);
            return;
        }

        setSleepSecondsLeft(sleepTimer * 60);
        const timer = setInterval(() => {
            setSleepSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setAtmosphereSound('off');
                    setFrequencySound('off');
                    setSleepTimerState('off');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [sleepTimer]);

    const formattedSleepTime = useMemo(() => {
        if (sleepSecondsLeft <= 0) return null;
        const mins = Math.floor(sleepSecondsLeft / 60);
        const secs = sleepSecondsLeft % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, [sleepSecondsLeft]);

    const isPlaying = atmosphereSound !== 'off' || frequencySound !== 'off';

    const stopAll = useCallback(() => {
        setAtmosphereSound('off');
        setFrequencySound('off');
    }, []);

    const applyPreset = useCallback((preset) => {
        setAtmosphereSound(preset.atmosphere);
        setFrequencySound(preset.frequency);
    }, []);

    // Backward compatibility for single-channel callers (such as FocusView)
    const soundType = atmosphereSound !== 'off' ? atmosphereSound : frequencySound;
    const setSoundType = useCallback((type) => {
        const isFreq = FREQUENCY_OPTIONS.some(f => f.id === type);
        if (type === 'off') {
            setAtmosphereSound('off');
            setFrequencySound('off');
        } else if (isFreq) {
            setFrequencySound(type);
        } else {
            setAtmosphereSound(type);
        }
    }, []);

    const volume = masterVolume;
    const setVolume = setMasterVolume;
    const soundOptions = useMemo(() => [
        ...ATMOSPHERE_OPTIONS,
        ...FREQUENCY_OPTIONS.filter(f => f.id !== 'off')
    ], []);

    return {
        // Dual-track mixer properties
        atmosphereSound,
        setAtmosphereSound,
        frequencySound,
        setFrequencySound,
        atmosphereVolume,
        setAtmosphereVolume,
        frequencyVolume,
        setFrequencyVolume,
        masterVolume,
        setMasterVolume,
        isPlaying,
        stopAll,
        applyPreset,
        ATMOSPHERE_OPTIONS,
        FREQUENCY_OPTIONS,
        SOUND_PRESETS,
        sleepTimer,
        setSleepTimer: setSleepTimerState,
        sleepTimerOptions: SLEEP_TIMER_OPTIONS,
        formattedSleepTime,
        // Backward compatibility
        soundType,
        setSoundType,
        volume,
        setVolume,
        soundOptions
    };
};
