import { describe, it, expect, beforeEach } from 'vitest';
import {
  openDB,
  setFile,
  getFile,
  deleteFile,
  saveDBSnapshot,
  getDBSnapshots,
  getDBSnapshotById,
  pruneOldSnapshots
} from '../src/utils/db';

describe('AuraDB IndexedDB v2 Storage Vault', () => {
  beforeEach(async () => {
    // Ensure clean state if necessary
  });

  it('successfully opens the database and initializes stores', async () => {
    const db = await openDB();
    expect(db.name).toBe('AuraDB');
    expect(db.objectStoreNames.contains('attachments')).toBe(true);
    expect(db.objectStoreNames.contains('snapshots')).toBe(true);
  });

  it('stores, retrieves, and deletes binary attachments or files', async () => {
    const testPayload = { name: 'sample.txt', type: 'text/plain', content: 'sample file content' };
    const fileKey = 'task-attach-test-1';

    await setFile(fileKey, testPayload);
    const retrieved = await getFile(fileKey);
    expect(retrieved).toBeDefined();
    expect(retrieved.name).toBe(testPayload.name);
    expect(retrieved.content).toBe(testPayload.content);

    await deleteFile(fileKey);
    const afterDelete = await getFile(fileKey);
    expect(afterDelete).toBeUndefined();
  });

  it('stores daily rolling snapshots and retrieves them in reverse chronological order', async () => {
    const snapshot1 = {
      id: 'snap-1',
      timestamp: 1000,
      date: '2026-09-18',
      data: { tasksCount: 5 }
    };
    const snapshot2 = {
      id: 'snap-2',
      timestamp: 2000,
      date: '2026-09-19',
      data: { tasksCount: 8 }
    };

    await saveDBSnapshot(snapshot1);
    await saveDBSnapshot(snapshot2);

    const list = await getDBSnapshots();
    expect(list.length).toBeGreaterThanOrEqual(2);
    // Verified sorted descending by timestamp
    expect(list[0].timestamp).toBeGreaterThanOrEqual(list[1].timestamp);

    const fetched = await getDBSnapshotById('snap-2');
    expect(fetched).toBeDefined();
    expect(fetched.data.tasksCount).toBe(8);
  });

  it('prunes old snapshots exceeding maximum retention limit', async () => {
    for (let i = 1; i <= 6; i++) {
      await saveDBSnapshot({
        id: `prune-snap-${i}`,
        timestamp: 10000 + i,
        date: `2026-09-${10 + i}`,
        data: {}
      });
    }

    await pruneOldSnapshots(3);
    const remaining = await getDBSnapshots();
    expect(remaining.length).toBeLessThanOrEqual(3);
  });
});
