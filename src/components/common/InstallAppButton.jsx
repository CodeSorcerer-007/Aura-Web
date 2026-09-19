import React, { useState, useEffect } from 'react';
import { Download, ShieldCheck } from 'lucide-react';

export const InstallAppButton = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detect if app is running in standalone mode (installed PWA / native window)
        const checkStandalone = () => {
            const isStand = window.matchMedia('(display-mode: standalone)').matches ||
                            window.navigator.standalone === true ||
                            document.referrer.includes('android-app://');
            setIsStandalone(isStand);
        };

        checkStandalone();
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleChange = () => checkStandalone();
        mediaQuery.addEventListener('change', handleChange);

        // Listen for PWA install prompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setIsStandalone(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else {
            // If browser hasn't fired beforeinstallprompt yet or user is on desktop browser
            alert(
                "To install Aura locally like WhatsApp Web or Instagram:\n\n" +
                "1. Look for the 'Install' icon (computer screen with arrow) in your browser's address bar (Chrome or Edge).\n" +
                "2. Click 'Install' or go to Browser Menu (⋮) -> 'Save and share' / 'Apps' -> 'Install Aura'.\n" +
                "3. Aura will be added to your Windows Start Menu and Desktop as a standalone offline app!"
            );
        }
    };

    if (isStandalone) {
        return (
            <div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium backdrop-blur-sm"
                title="Aura is installed and running 100% locally on your machine"
            >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Offline App</span>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 border border-cyan-400/30 text-cyan-200 hover:text-white text-xs font-medium transition-all shadow-sm hover:shadow-[0_0_12px_rgba(34,211,238,0.25)] group cursor-pointer"
            title="Install Aura to your Windows Desktop & Start Menu (Works 100% Offline)"
            aria-label="Install Aura as offline desktop app"
        >
            <Download className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-110 transition-transform animate-bounce" />
            <span className="font-semibold tracking-wide">Install App</span>
        </button>
    );
};
