// --- Aura Offline Snapshot Vault & File System Safety Manager ---

const SNAPSHOTS_KEY = 'aura-rolling-snapshots';
const MAX_SNAPSHOTS = 7;

/**
 * Record a daily rolling snapshot into localStorage
 * @param {Object} payload - Current state from contexts
 */
export const recordDailySnapshot = (payload) => {
    try {
        if (typeof window === 'undefined' || !payload) return;

        const todayDate = new Date().toISOString().split('T')[0];
        const raw = localStorage.getItem(SNAPSHOTS_KEY);
        let snapshots = raw ? JSON.parse(raw) : [];

        if (!Array.isArray(snapshots)) snapshots = [];

        const taskCount = Array.isArray(payload.tasks) ? payload.tasks.length : 0;
        const completedCount = Array.isArray(payload.tasks) ? payload.tasks.filter(t => t.completed).length : 0;
        const groveCount = Array.isArray(payload.grove) ? payload.grove.length : 0;

        const newSnapshot = {
            id: `snap_${Date.now()}`,
            date: todayDate,
            timestamp: Date.now(),
            taskCount,
            completedCount,
            groveCount,
            data: payload
        };

        // If a snapshot already exists for today, replace it with the latest state
        const existingIndex = snapshots.findIndex(s => s.date === todayDate);
        if (existingIndex >= 0) {
            snapshots[existingIndex] = newSnapshot;
        } else {
            snapshots.unshift(newSnapshot);
        }

        // Keep only up to MAX_SNAPSHOTS
        if (snapshots.length > MAX_SNAPSHOTS) {
            snapshots = snapshots.slice(0, MAX_SNAPSHOTS);
        }

        localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
    } catch (e) {
        console.warn('Snapshot vault record warning:', e);
    }
};

/**
 * Get all available rolling snapshots (without full data to keep memory light)
 */
export const getRollingSnapshots = () => {
    try {
        if (typeof window === 'undefined') return [];
        const raw = localStorage.getItem(SNAPSHOTS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed.map(s => ({
            id: s.id,
            date: s.date,
            timestamp: s.timestamp,
            taskCount: s.taskCount || 0,
            completedCount: s.completedCount || 0,
            groveCount: s.groveCount || 0
        }));
    } catch {
        return [];
    }
};

/**
 * Retrieve full snapshot data for restoration
 */
export const getSnapshotDataById = (snapshotId) => {
    try {
        if (typeof window === 'undefined') return null;
        const raw = localStorage.getItem(SNAPSHOTS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const match = parsed.find(s => s.id === snapshotId);
        return match ? match.data : null;
    } catch {
        return null;
    }
};

/**
 * Export safety vault directly to local disk using File System Access API (with fallback)
 */
export const exportSafetyVaultToFile = async (payload) => {
    const today = new Date().toISOString().split('T')[0];
    const defaultFilename = `aura-safety-vault-${today}.json`;
    const jsonString = JSON.stringify(payload, null, 2);

    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: defaultFilename,
                types: [{
                    description: 'Aura Safety Vault (.json)',
                    accept: { 'application/json': ['.json'] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(jsonString);
            await writable.close();
            return { success: true, native: true };
        } catch (err) {
            // User cancelled file picker
            if (err.name === 'AbortError') {
                return { success: false, aborted: true };
            }
        }
    }

    // Fallback standard download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true, native: false };
};
