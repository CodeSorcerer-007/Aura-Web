import { describe, it, expect, beforeEach } from 'vitest';
import {
    recordDailySnapshot,
    getRollingSnapshots,
    getSnapshotDataById,
    exportSafetyVaultToFile
} from '../src/utils/snapshotVault';

describe('snapshotVault', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('records a daily snapshot and updates rolling snapshots meta', async () => {
        const dummyPayload = {
            tasks: [
                { id: '1', text: 'Task 1', completed: true },
                { id: '2', text: 'Task 2', completed: false }
            ],
            grove: [{ id: 'g1', type: 'oak', growthPoints: 50, maxGrowth: 100 }]
        };

        await recordDailySnapshot(dummyPayload);

        const snapshots = getRollingSnapshots();
        expect(snapshots.length).toBeGreaterThanOrEqual(1);

        const latest = snapshots[0];
        expect(latest.taskCount).toBe(2);
        expect(latest.completedCount).toBe(1);
        expect(latest.groveCount).toBe(1);

        // Fetch back full data from IndexedDB
        const fullData = await getSnapshotDataById(latest.id);
        expect(fullData).not.toBeNull();
        expect(fullData.tasks).toHaveLength(2);
        expect(fullData.tasks[0].text).toBe('Task 1');
    });

    it('handles null payload gracefully without throwing', async () => {
        await expect(recordDailySnapshot(null)).resolves.not.toThrow();
    });

    it('returns null for non-existent snapshot ID', async () => {
        const result = await getSnapshotDataById('non-existent-id-999');
        expect(result).toBeNull();
    });

    it('exports safety vault using fallback download when showSaveFilePicker is absent', async () => {
        const payload = { tasks: [{ id: 't1', text: 'Safe Task' }] };
        const res = await exportSafetyVaultToFile(payload);
        expect(res.success).toBe(true);
        expect(res.native).toBe(false);
    });
});
