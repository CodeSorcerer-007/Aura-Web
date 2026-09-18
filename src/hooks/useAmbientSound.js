import { useRef, useEffect, useState, useCallback } from 'react';
import * as Tone from 'tone';

export const SOUND_OPTIONS = [
    { id: 'off', label: 'Off', icon: 'VolumeX' },
    { id: 'rain', label: 'Rain', icon: 'CloudRain' },
    { id: 'ocean', label: 'Ocean Waves', icon: 'Waves' },
    { id: 'wind', label: 'Forest Wind', icon: 'Wind' },
    { id: 'waves_theta', label: 'Theta Waves (6Hz)', icon: 'Zap' },
    { id: 'waves_alpha', label: 'Alpha Focus (10Hz)', icon: 'Sparkles' },
    { id: 'pink', label: 'Pink Noise', icon: 'Volume2' },
    { id: 'brown', label: 'Brown Noise', icon: 'Volume2' },
    { id: 'white', label: 'White Noise', icon: 'Volume2' },
];

export const useAmbientSound = (isActive, initialSound = 'off') => {
    const [soundType, setSoundType] = useState(initialSound);
    const [volume, setVolume] = useState(0.5); // 0 to 1
    const soundNodesRef = useRef(null);

    const cleanupSound = useCallback(() => {
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

    return {
        soundType,
        setSoundType,
        volume,
        setVolume: handleVolumeChange,
        soundOptions: SOUND_OPTIONS
    };
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
                    new Tone.Synth({
                        oscillator: { type: 'triangle' },
                        envelope: { attack: 0.02, decay: 0.2, sustain: 0.1, release: 0.2 }
                    }).toDestination().triggerAttackRelease("E6", "8n", now);
                    break;
                case 'achievement':
                    new Tone.PluckSynth().toDestination().triggerAttackRelease("C7", "8n", now);
                    break;
                default:
                    break;
            }
        }).catch(e => console.warn("Audio unlock pending gesture:", e));
    } catch (e) {
        console.error("Error playing UI sound:", e);
    }
};
