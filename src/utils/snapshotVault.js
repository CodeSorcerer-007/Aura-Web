// --- Aura Offline Snapshot Vault & File System Safety Manager ---
import {
    saveDBSnapshot,
    getDBSnapshotById,
    pruneOldSnapshots,
    getAllStoredAttachments,
    putAllAttachments
} from './db';
import { getTodayDateString } from './dateUtils';

const SNAPSHOTS_META_KEY = 'aura-snapshots-meta';
const LEGACY_SNAPSHOTS_KEY = 'aura-rolling-snapshots';
const MAX_SNAPSHOTS = 14;

// Cache in memory for instant synchronous lookup
let cachedSnapshotMetas = null;

const loadSnapshotMetas = () => {
    if (cachedSnapshotMetas !== null) return cachedSnapshotMetas;
    try {
        if (typeof window === 'undefined') return [];
        const raw = localStorage.getItem(SNAPSHOTS_META_KEY);
        if (raw) {
            cachedSnapshotMetas = JSON.parse(raw);
            if (Array.isArray(cachedSnapshotMetas)) return cachedSnapshotMetas;
        }
    } catch {
        cachedSnapshotMetas = [];
    }
    cachedSnapshotMetas = [];
    return cachedSnapshotMetas;
};

// Auto-migrate any existing legacy snapshots from localStorage to IndexedDB once
const migrateLegacySnapshots = async () => {
    try {
        if (typeof window === 'undefined') return;
        const legacyRaw = localStorage.getItem(LEGACY_SNAPSHOTS_KEY);
        if (legacyRaw) {
            const legacyList = JSON.parse(legacyRaw);
            if (Array.isArray(legacyList) && legacyList.length > 0) {
                for (const snap of legacyList) {
                    if (snap && snap.id) {
                        await saveDBSnapshot(snap);
                    }
                }
            }
            // Free up the 5MB localStorage space immediately
            localStorage.removeItem(LEGACY_SNAPSHOTS_KEY);
        }
    } catch (e) {
        console.warn('Legacy snapshot migration notice:', e);
    }
};

// Run migration in background on boot
if (typeof window !== 'undefined') {
    setTimeout(migrateLegacySnapshots, 1000);
}

/**
 * Record a daily rolling snapshot into IndexedDB and keep light metadata in sync
 * @param {Object} payload - Current state from contexts
 */
export const recordDailySnapshot = async (payload) => {
    try {
        if (typeof window === 'undefined' || !payload) return;

        const todayDate = getTodayDateString();
        const taskCount = Array.isArray(payload.tasks) ? payload.tasks.length : 0;
        const completedCount = Array.isArray(payload.tasks) ? payload.tasks.filter(t => t.completed).length : 0;
        const groveCount = Array.isArray(payload.grove) ? payload.grove.length : 0;

        const snapshotId = `snap_${Date.now()}`;
        const newSnapshot = {
            id: snapshotId,
            date: todayDate,
            timestamp: Date.now(),
            taskCount,
            completedCount,
            groveCount,
            data: payload
        };

        // 1. Save full data payload into IndexedDB (unlimited quota)
        await saveDBSnapshot(newSnapshot);
        await pruneOldSnapshots(MAX_SNAPSHOTS);

        // 2. Maintain lightweight metadata list in memory & localStorage (no heavy payload)
        let metas = loadSnapshotMetas();
        const metaEntry = {
            id: snapshotId,
            date: todayDate,
            timestamp: newSnapshot.timestamp,
            taskCount,
            completedCount,
            groveCount
        };

        const existingIndex = metas.findIndex(m => m.date === todayDate);
        if (existingIndex >= 0) {
            metas[existingIndex] = metaEntry;
        } else {
            metas.unshift(metaEntry);
        }

        if (metas.length > MAX_SNAPSHOTS) {
            metas = metas.slice(0, MAX_SNAPSHOTS);
        }

        cachedSnapshotMetas = metas;
        try {
            localStorage.setItem(SNAPSHOTS_META_KEY, JSON.stringify(metas));
        } catch {}

        // Ensure legacy heavy key is cleared
        try {
            localStorage.removeItem(LEGACY_SNAPSHOTS_KEY);
        } catch {}
    } catch (e) {
        console.warn('Snapshot vault record warning:', e);
    }
};

/**
 * Get all available rolling snapshot metadata (instant synchronous return for UI)
 */
export const getRollingSnapshots = () => {
    return loadSnapshotMetas();
};

/**
 * Retrieve full snapshot data for restoration (from IndexedDB with memory fallback)
 */
export const getSnapshotDataById = async (snapshotId) => {
    try {
        if (typeof window === 'undefined') return null;
        const match = await getDBSnapshotById(snapshotId);
        if (match && match.data) {
            return match.data;
        }
        return null;
    } catch {
        return null;
    }
};

/**
 * Export complete safety vault directly to local disk using File System Access API (with attachments bundled!)
 */
export const exportSafetyVaultToFile = async (payload) => {
    const today = getTodayDateString();
    const defaultFilename = `aura-safety-vault-${today}.json`;

    // Losslessly bundle all attachments & voice memos from IndexedDB
    let vaultData = { ...payload };
    try {
        const attachmentsMap = await getAllStoredAttachments();
        if (attachmentsMap && Object.keys(attachmentsMap).length > 0) {
            vaultData.vaultAttachments = attachmentsMap;
        }
    } catch (e) {
        console.warn('Could not bundle attachments into vault:', e);
    }

    const jsonString = JSON.stringify(vaultData, null, 2);

    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: defaultFilename,
                types: [{
                    description: 'Aura Lossless Safety Vault (.json)',
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

    // Fallback standard browser download
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

export { putAllAttachments };

