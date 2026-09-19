import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as Tone from 'tone';

export const SOUND_OPTIONS = [
    { id: 'off', label: 'Off', icon: 'VolumeX' },
    { id: 'solfeggio_432', label: '432 Hz Alpha Harmony', icon: 'Radio' },
    { id: 'solfeggio_528', label: '528 Hz Transformation', icon: 'Zap' },
    { id: 'chimes_procedural', label: 'Zen Tibetan Chimes', icon: 'Bell' },
    { id: 'rain', label: 'Rain', icon: 'CloudRain' },
    { id: 'ocean', label: 'Ocean Waves', icon: 'Waves' },
    { id: 'wind', label: 'Forest Wind', icon: 'Wind' },
    { id: 'waves_theta', label: 'Theta Waves (6Hz)', icon: 'Zap' },
    { id: 'waves_alpha', label: 'Alpha Focus (10Hz)', icon: 'Sparkles' },
    { id: 'brown', label: 'Brown Noise', icon: 'Volume2' },
    { id: 'pink', label: 'Pink Noise', icon: 'Volume2' },
    { id: 'white', label: 'White Noise', icon: 'Volume2' },
];

export const SLEEP_TIMER_OPTIONS = [
    { id: 'off', label: 'Off' },
    { id: 15, label: '15m' },
    { id: 25, label: '25m' },
    { id: 50, label: '50m' },
    { id: 60, label: '60m' }
];

export const useAmbientSound = (isActive, initialSound = 'off') => {
    const [soundType, setSoundType] = useState(initialSound);
    const [volume, setVolume] = useState(0.5); // 0 to 1
    const [sleepTimer, setSleepTimerState] = useState('off'); // 'off' | 15 | 25 | 50 | 60
    const [sleepSecondsLeft, setSleepSecondsLeft] = useState(0);
    const soundNodesRef = useRef(null);
    const chimesIntervalRef = useRef(null);

    const cleanupSound = useCallback(() => {
        if (chimesIntervalRef.current) {
            clearInterval(chimesIntervalRef.current);
            chimesIntervalRef.current = null;
        }

        if (soundNodesRef.current) {
            try {
                if (soundNodesRef.current.stop) soundNodesRef.current.stop();
                if (soundNodesRef.current.dispose) soundNodesRef.current.dispose();
                if (Array.isArray(soundNodesRef.current)) {
                    soundNodesRef.current.forEach(node => {
                        if (node.stop) node.stop();
                        if (node.dispose) node.dispose();
                    });
                }
            } catch (e) {
                console.error("Audio cleanup error:", e);
            }
            soundNodesRef.current = null;
        }
    }, []);

    // Create and start ambient soundscape based on soundType
    useEffect(() => {
        cleanupSound();

        if (soundType === 'off') return;

        try {
            // Convert 0..1 volume to decibels (-40dB to 0dB)
            const dbVal = volume <= 0.01 ? -Infinity : Tone.gainToDb(volume * 0.4);

            if (soundType === 'pink' || soundType === 'brown' || soundType === 'white') {
                const noise = new Tone.Noise(soundType).toDestination();
                noise.volume.value = dbVal;
                soundNodesRef.current = noise;
            } else if (soundType === 'rain') {
                // Rain: Pink noise through a lowpass filter
                const noise = new Tone.Noise('pink');
                const filter = new Tone.Filter({
                    type: 'lowpass',
                    frequency: 1200,
                    rolloff: -24
                });
                const gain = new Tone.Gain(Tone.dbToGain(dbVal)).toDestination();
                noise.connect(filter);
                filter.connect(gain);
                soundNodesRef.current = {
                    start: () => noise.start(),
                    stop: () => noise.stop(),
                    dispose: () => {
                        noise.dispose();
                        filter.dispose();
                        gain.dispose();
                    },
                    setVolume: (val) => { gain.gain.rampTo(Tone.dbToGain(val), 0.1); }
                };
            } else if (soundType === 'ocean') {
                // Ocean: Brown noise through an LFO-modulated lowpass filter
                const noise = new Tone.Noise('brown');
                const filter = new Tone.Filter({
                    type: 'lowpass',
                    frequency: 300,
                    rolloff: -12
                });
                const lfo = new Tone.LFO({
                    frequency: 0.1, // 10 second wave cycle
                    min: 150,
                    max: 800
                });
                lfo.connect(filter.frequency);
                const gain = new Tone.Gain(Tone.dbToGain(dbVal)).toDestination();
                noise.connect(filter);
                filter.connect(gain);

                soundNodesRef.current = {
                    start: () => {
                        noise.start();
                        lfo.start();
                    },
                    stop: () => {
                        noise.stop();
                        lfo.stop();
                    },
                    dispose: () => {
                        noise.dispose();
                        filter.dispose();
                        lfo.dispose();
                        gain.dispose();
                    },
                    setVolume: (val) => { gain.gain.rampTo(Tone.dbToGain(val), 0.1); }
                };
            } else if (soundType === 'wind') {
                // Forest Wind: Pink noise with soft undulating filter
                const noise = new Tone.Noise('pink');
                const filter = new Tone.Filter({
                    type: 'bandpass',
                    frequency: 500,
                    Q: 1.5
                });
                const lfo = new Tone.LFO({
                    frequency: 0.15,
                    min: 200,
                    max: 700
                });
                lfo.connect(filter.frequency);
                const gain = new Tone.Gain(Tone.dbToGain(dbVal)).toDestination();
                noise.connect(filter);
                filter.connect(gain);

                soundNodesRef.current = {
                    start: () => { noise.start(); lfo.start(); },
                    stop: () => { noise.stop(); lfo.stop(); },
                    dispose: () => { noise.dispose(); filter.dispose(); lfo.dispose(); gain.dispose(); },
                    setVolume: (val) => { gain.gain.rampTo(Tone.dbToGain(val), 0.1); }
                };
            } else if (soundType === 'solfeggio_432') {
                // 432 Hz Solfeggio Alpha Harmony with 8Hz theta beat
                const oscMain = new Tone.Oscillator(432, 'sine');
                const oscHarmonic = new Tone.Oscillator(432 + 8, 'sine'); // 8Hz binaural differential
                const pannerL = new Tone.Panner(-0.6);
                const pannerR = new Tone.Panner(0.6);
                const gain = new Tone.Gain(Tone.dbToGain(dbVal * 0.75)).toDestination();

                oscMain.connect(pannerL);
                pannerL.connect(gain);
                oscHarmonic.connect(pannerR);
                pannerR.connect(gain);

                soundNodesRef.current = {
                    start: () => { oscMain.start(); oscHarmonic.start(); },
                    stop: () => { oscMain.stop(); oscHarmonic.stop(); },
                    dispose: () => { oscMain.dispose(); oscHarmonic.dispose(); pannerL.dispose(); pannerR.dispose(); gain.dispose(); },
                    setVolume: (val) => { gain.gain.rampTo(Tone.dbToGain(val * 0.75), 0.1); }
                };
            } else if (soundType === 'solfeggio_528') {
                // 528 Hz Transformation / Miracle frequency with warm overtone
                const oscMain = new Tone.Oscillator(528, 'sine');
                const oscOvertone = new Tone.Oscillator(1056, 'sine');
                const gainMain = new Tone.Gain(Tone.dbToGain(dbVal * 0.8)).toDestination();
                const gainOver = new Tone.Gain(Tone.dbToGain(dbVal * 0.2)).toDestination();

                oscMain.connect(gainMain);
                oscOvertone.connect(gainOver);

                soundNodesRef.current = {
                    start: () => { oscMain.start(); oscOvertone.start(); },
                    stop: () => { oscMain.stop(); oscOvertone.stop(); },
                    dispose: () => { oscMain.dispose(); oscOvertone.dispose(); gainMain.dispose(); gainOver.dispose(); },
                    setVolume: (val) => {
                        gainMain.gain.rampTo(Tone.dbToGain(val * 0.8), 0.1);
                        gainOver.gain.rampTo(Tone.dbToGain(val * 0.2), 0.1);
                    }
                };
            } else if (soundType === 'chimes_procedural') {
                // Zen Tibetan Chimes: Generative pentatonic acoustic strikes every 30-50s
                const poly = new Tone.PolySynth(Tone.Synth, {
                    oscillator: { type: 'sine' },
                    envelope: { attack: 0.05, decay: 4.5, sustain: 0, release: 3 }
                }).toDestination();
                poly.volume.value = dbVal - 2;

                const notes = ['C4', 'Eb4', 'F4', 'G4', 'Bb4', 'C5', 'Eb5'];
                const playRandomChime = () => {
                    const note = notes[Math.floor(Math.random() * notes.length)];
                    poly.triggerAttackRelease(note, 4.5);
                };

                // Play first chime shortly after start
                const initialTimeout = setTimeout(playRandomChime, 1500);
                chimesIntervalRef.current = setInterval(playRandomChime, 25000);

                soundNodesRef.current = {
                    start: () => {},
                    stop: () => {
                        clearTimeout(initialTimeout);
                        if (chimesIntervalRef.current) clearInterval(chimesIntervalRef.current);
                    },
                    dispose: () => {
                        clearTimeout(initialTimeout);
                        if (chimesIntervalRef.current) clearInterval(chimesIntervalRef.current);
                        poly.dispose();
                    },
                    setVolume: (val) => { poly.volume.rampTo(val - 2, 0.1); }
                };
            } else if (soundType === 'waves_theta' || soundType === 'waves_alpha') {
                // Binaural beats: Dual sine waves routed to Left and Right
                const baseFreq = 200;
                const offset = soundType === 'waves_theta' ? 6 : 10; // 6Hz theta, 10Hz alpha

                const oscL = new Tone.Oscillator(baseFreq, 'sine');
                const oscR = new Tone.Oscillator(baseFreq + offset, 'sine');
                const pannerL = new Tone.Panner(-1);
                const pannerR = new Tone.Panner(1);
                const gain = new Tone.Gain(Tone.dbToGain(dbVal * 0.7)).toDestination();

                oscL.connect(pannerL);
                pannerL.connect(gain);
                oscR.connect(pannerR);
                pannerR.connect(gain);

                soundNodesRef.current = {
                    start: () => { oscL.start(); oscR.start(); },
                    stop: () => { oscL.stop(); oscR.stop(); },
                    dispose: () => { oscL.dispose(); oscR.dispose(); pannerL.dispose(); pannerR.dispose(); gain.dispose(); },
                    setVolume: (val) => { gain.gain.rampTo(Tone.dbToGain(val * 0.7), 0.1); }
                };
            }

            if (isActive && soundNodesRef.current) {
                Tone.start().then(() => {
                    if (soundNodesRef.current && soundNodesRef.current.start) {
                        soundNodesRef.current.start();
                    }
                }).catch(e => console.warn("Tone context start:", e));
            }
        } catch (e) {
            console.error("Error starting ambient sound:", e);
        }

        return () => {
            cleanupSound();
        };
    }, [soundType, cleanupSound, isActive, volume]);

    // Handle timer active/pause changes
    useEffect(() => {
        if (!soundNodesRef.current) return;

        if (isActive) {
            Tone.start().then(() => {
                if (soundNodesRef.current && soundNodesRef.current.start) {
                    soundNodesRef.current.start();
                }
            }).catch(e => console.warn("Tone context start:", e));
        } else {
            if (soundNodesRef.current && soundNodesRef.current.stop) {
                soundNodesRef.current.stop();
            }
        }
    }, [isActive]);

    const handleVolumeChange = (newVol) => {
        setVolume(newVol);
        if (soundNodesRef.current) {
            const dbVal = newVol <= 0.01 ? -Infinity : Tone.gainToDb(newVol * 0.4);
            if (soundNodesRef.current.setVolume) {
                soundNodesRef.current.setVolume(dbVal);
            } else if (soundNodesRef.current.volume) {
                soundNodesRef.current.volume.value = dbVal;
            }
        }
    };

    // Sleep Timer countdown and auto-fade
    const handleSetSleepTimer = (minutes) => {
        setSleepTimerState(minutes);
        if (minutes === 'off') {
            setSleepSecondsLeft(0);
        } else {
            setSleepSecondsLeft(minutes * 60);
        }
    };

    useEffect(() => {
        if (sleepTimer === 'off' || sleepSecondsLeft <= 0 || !isActive || soundType === 'off') {
            return;
        }

        const interval = setInterval(() => {
            setSleepSecondsLeft((prev) => {
                if (prev <= 1) {
                    cleanupSound();
                    setSoundType('off');
                    setSleepTimerState('off');
                    return 0;
                }

                // Smooth gradual fade in the final 60 seconds
                if (prev <= 60 && soundNodesRef.current) {
                    const fadeFactor = prev / 60;
                    const fadeDb = Tone.gainToDb(volume * 0.4 * fadeFactor);
                    if (soundNodesRef.current.setVolume) {
                        soundNodesRef.current.setVolume(fadeDb);
                    } else if (soundNodesRef.current.volume) {
                        soundNodesRef.current.volume.value = fadeDb;
                    }
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [sleepTimer, sleepSecondsLeft, isActive, soundType, volume, cleanupSound]);

    const formattedSleepTime = useMemo(() => {
        if (sleepTimer === 'off' || sleepSecondsLeft <= 0) return null;
        const mins = Math.floor(sleepSecondsLeft / 60);
        const secs = sleepSecondsLeft % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }, [sleepTimer, sleepSecondsLeft]);

    return {
        soundType,
        setSoundType,
        volume,
        setVolume: handleVolumeChange,
        soundOptions: SOUND_OPTIONS,
        sleepTimer,
        sleepSecondsLeft,
        setSleepTimer: handleSetSleepTimer,
        sleepTimerOptions: SLEEP_TIMER_OPTIONS,
        formattedSleepTime
    };
};

// Acoustic Tibetan Singing Bowl Harmonic Chime
export const playTibetanBowl = (fundamental = 216) => {
    try {
        Tone.start().then(() => {
            const now = Tone.now();
            const poly = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'sine' },
                envelope: { attack: 0.08, decay: 4.2, sustain: 0, release: 2.5 }
            }).toDestination();
            poly.volume.value = -6;

            // Natural partials of an acoustic singing bowl (Fundamental, Octave, 5th, Shimmer)
            poly.triggerAttackRelease([fundamental, fundamental * 2, fundamental * 2.98, fundamental * 4], 4.2, now);
        }).catch(e => console.warn("Audio context unlock pending:", e));
    } catch (e) {
        console.warn("Tibetan bowl error:", e);
    }
};

export const playUiSound = (effect, enabled = true) => {
    if (!enabled) return;

    try {
        Tone.start().then(() => {
            const now = Tone.now();
            switch (effect) {
                case 'add':
                    new Tone.Synth({
                        oscillator: { type: 'sine' },
                        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
                    }).toDestination().triggerAttackRelease("C5", "16n", now);
                    break;
                case 'complete':
                    // Resonant Tibetan Singing Bowl chime on completing tasks
                    playTibetanBowl(216);
                    break;
                case 'achievement':
                    playTibetanBowl(288);
                    break;
                default:
                    break;
            }
        }).catch(e => console.warn("Audio unlock pending gesture:", e));
    } catch (e) {
        console.error("Error playing UI sound:", e);
    }
};
