// --- Aura Offline IndexedDB Storage Vault (Version 2) ---
const DB_NAME = 'AuraDB';
const DB_VERSION = 2;
const STORE_ATTACHMENTS = 'attachments';
const STORE_SNAPSHOTS = 'snapshots';

export const openDB = () => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
            return reject('IndexedDB not supported in this environment');
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error || 'Error opening IndexedDB');
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_ATTACHMENTS)) {
                db.createObjectStore(STORE_ATTACHMENTS);
            }
            if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
                db.createObjectStore(STORE_SNAPSHOTS, { keyPath: 'id' });
            }
        };
    });
};

// --- Attachments & Voice Notes Storage ---

export const setFile = async (key, value) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_ATTACHMENTS, 'readwrite');
        const store = transaction.objectStore(STORE_ATTACHMENTS);
        const request = store.put(value, key);
        transaction.oncomplete = () => resolve(request.result);
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getFile = async (key) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_ATTACHMENTS, 'readonly');
        const store = transaction.objectStore(STORE_ATTACHMENTS);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const deleteFile = async (key) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_ATTACHMENTS, 'readwrite');
        const store = transaction.objectStore(STORE_ATTACHMENTS);
        const request = store.delete(key);
        transaction.oncomplete = () => resolve(request.result);
        transaction.onerror = () => reject(transaction.error);
    });
};

// --- Lossless Attachments Serialization for Safety Vault ---

const blobToDataURL = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const dataURLToBlob = (dataUrl) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

export const getAllStoredAttachments = async () => {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const transaction = db.transaction(STORE_ATTACHMENTS, 'readonly');
            const store = transaction.objectStore(STORE_ATTACHMENTS);
            const request = store.openCursor();
            const result = {};
            const promises = [];

            request.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    const key = cursor.key;
                    const val = cursor.value;
                    if (val instanceof Blob) {
                        promises.push(
                            blobToDataURL(val).then(dataUrl => {
                                result[key] = {
                                    dataUrl,
                                    type: val.type,
                                    name: val.name || key
                                };
                            }).catch(() => {})
                        );
                    }
                    cursor.continue();
                } else {
                    Promise.all(promises).then(() => resolve(result));
                }
            };
            request.onerror = () => resolve({});
        });
    } catch {
        return {};
    }
};

export const putAllAttachments = async (attachmentsMap) => {
    if (!attachmentsMap || typeof attachmentsMap !== 'object') return;
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_ATTACHMENTS, 'readwrite');
        const store = transaction.objectStore(STORE_ATTACHMENTS);

        for (const [key, item] of Object.entries(attachmentsMap)) {
            if (item && item.dataUrl) {
                try {
                    const blob = dataURLToBlob(item.dataUrl);
                    store.put(blob, key);
                } catch (e) {
                    console.warn(`Failed restoring attachment ${key}:`, e);
                }
            }
        }
        return new Promise((resolve) => {
            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => resolve(false);
        });
    } catch (err) {
        console.error('Error importing attachments:', err);
    }
};

// --- Rolling Daily Snapshots Storage (Stored in IndexedDB to avoid 5MB quota) ---

export const saveDBSnapshot = async (snapshot) => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_SNAPSHOTS, 'readwrite');
            const store = transaction.objectStore(STORE_SNAPSHOTS);
            const request = store.put(snapshot);
            transaction.oncomplete = () => resolve(request.result);
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (e) {
        console.warn('saveDBSnapshot error:', e);
    }
};

export const getDBSnapshots = async () => {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const transaction = db.transaction(STORE_SNAPSHOTS, 'readonly');
            const store = transaction.objectStore(STORE_SNAPSHOTS);
            const request = store.getAll();
            request.onsuccess = () => {
                const list = request.result || [];
                list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                resolve(list);
            };
            request.onerror = () => resolve([]);
        });
    } catch {
        return [];
    }
};

export const getDBSnapshotById = async (id) => {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const transaction = db.transaction(STORE_SNAPSHOTS, 'readonly');
            const store = transaction.objectStore(STORE_SNAPSHOTS);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => resolve(null);
        });
    } catch {
        return null;
    }
};

export const pruneOldSnapshots = async (maxKeep = 14) => {
    try {
        const list = await getDBSnapshots();
        if (list.length > maxKeep) {
            const toDelete = list.slice(maxKeep);
            const db = await openDB();
            const transaction = db.transaction(STORE_SNAPSHOTS, 'readwrite');
            const store = transaction.objectStore(STORE_SNAPSHOTS);
            toDelete.forEach(s => store.delete(s.id));
        }
    } catch (e) {
        console.warn('pruneOldSnapshots error:', e);
    }
};
