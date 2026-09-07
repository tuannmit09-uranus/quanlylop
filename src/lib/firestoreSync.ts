import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db, saveDocumentToFirestore, deleteDocumentFromFirestore, cleanDataForFirestore, OperationType, handleFirestoreError } from './firebase';

// In-memory runtime state (ZERO localStorage usage)
const memoryDeletedTenantIds = new Set<string>();
let memoryIsInitialized = false;
let memoryCustomCredentials: Record<string, string> = {
  'tonga190984@gmail.com': '123456a@',
  'tuannmit09@uranustech.vn': '123456a@',
  'tuannmit09@gmail.com': '123456a@',
};

/**
 * Get in-memory recorded deleted tenant IDs
 */
export function getDeletedTenantIdsLocal(): Set<string> {
  return memoryDeletedTenantIds;
}

/**
 * Record a deleted tenant ID in-memory and in Firestore
 */
export async function recordDeletedTenantId(tenantId: string): Promise<void> {
  try {
    memoryDeletedTenantIds.add(tenantId);

    // Record in Firestore system document so all sessions/devices respect this deletion
    const sysDocRef = doc(db, '_system', 'deleted_tenants');
    await setDoc(sysDocRef, {
      [tenantId]: {
        deletedAt: new Date().toISOString(),
      },
    }, { merge: true });
  } catch (e) {
    console.warn('recordDeletedTenantId note:', e);
  }
}

/**
 * Fetch list of deleted tenant IDs from Firestore
 */
export async function fetchDeletedTenantIdsFromFirestore(): Promise<string[]> {
  try {
    const sysDocRef = doc(db, '_system', 'deleted_tenants');
    const snap = await getDoc(sysDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const ids = Object.keys(data || {});
      ids.forEach((id) => memoryDeletedTenantIds.add(id));
      return ids;
    }
  } catch (e) {
    console.warn('fetchDeletedTenantIdsFromFirestore note:', e);
  }
  return Array.from(memoryDeletedTenantIds);
}

/**
 * Check if the system has already been initialized (so it never auto-resurrects deleted demo data)
 */
export async function isSystemAlreadyInitialized(): Promise<boolean> {
  if (memoryIsInitialized) return true;
  try {
    const initDoc = await getDoc(doc(db, '_system', 'init_status'));
    if (initDoc.exists()) {
      memoryIsInitialized = true;
      return true;
    }
  } catch {}
  return false;
}

/**
 * Mark system as initialized
 */
export async function markSystemInitialized(): Promise<void> {
  memoryIsInitialized = true;
  try {
    await setDoc(doc(db, '_system', 'init_status'), {
      initialized: true,
      initializedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.warn('markSystemInitialized note:', e);
  }
}

/**
 * Fetch custom credentials from Firestore _system/credentials
 */
export async function fetchCustomCredentialsFromFirestore(): Promise<Record<string, string>> {
  try {
    const credsDoc = await getDoc(doc(db, '_system', 'credentials'));
    if (credsDoc.exists()) {
      const data = credsDoc.data() as Record<string, string>;
      memoryCustomCredentials = { ...memoryCustomCredentials, ...data };
    }
  } catch (e) {
    console.warn('fetchCustomCredentialsFromFirestore note:', e);
  }
  return memoryCustomCredentials;
}

/**
 * Save custom credentials directly to Firestore _system/credentials
 */
export async function saveCustomCredentialsToFirestore(creds: Record<string, string>): Promise<void> {
  try {
    memoryCustomCredentials = { ...memoryCustomCredentials, ...creds };
    await setDoc(doc(db, '_system', 'credentials'), creds, { merge: true });
  } catch (e) {
    console.warn('saveCustomCredentialsToFirestore note:', e);
  }
}

export function getMemoryCustomCredentials(): Record<string, string> {
  return memoryCustomCredentials;
}

/**
 * Delete a tenant and every dependent item from Cloud Firestore completely
 */
export async function deleteTenantFromFirestore(tenantId: string): Promise<void> {
  try {
    // 1. Mark as deleted first
    await recordDeletedTenantId(tenantId);

    // 2. Delete the tenant document
    await deleteDoc(doc(db, 'tenants', tenantId));

    // 3. Dependent collections to clean up
    const dependentCollections = [
      'classes',
      'students',
      'schools',
      'subjects',
      'parents',
      'parent_students',
      'account_invitations',
      'schedules',
      'sessions',
      'lessons',
      'attendance',
      'evaluations',
      'homeworks',
      'submissions',
      'comments',
      'tuitions',
      'bankStatements',
      'bankTransactions',
      'notifications',
    ];

    for (const colName of dependentCollections) {
      try {
        const colSnap = await getDocs(collection(db, colName));
        if (!colSnap.empty) {
          const batch = writeBatch(db);
          let count = 0;
          colSnap.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.tenant_id === tenantId || docSnap.id.includes(tenantId)) {
              batch.delete(docSnap.ref);
              count++;
            }
          });
          if (count > 0) {
            await batch.commit();
            console.log(`Deleted ${count} items from ${colName} for tenant ${tenantId}`);
          }
        }
      } catch (err) {
        console.warn(`Error cleaning up collection ${colName} for tenant ${tenantId}:`, err);
      }
    }
  } catch (err) {
    console.error(`deleteTenantFromFirestore failed for ${tenantId}:`, err);
  }
}

/**
 * Seed initial data collection into Firestore if empty
 */
export async function seedCollectionIfEmpty<T extends { id: string }>(
  collectionName: string,
  initialItems: T[]
): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    if (!snapshot.empty) {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as T), id: docSnap.id });
      });
      return items;
    }

    // Collection is empty, seed initial records in batch
    if (initialItems.length > 0) {
      console.log(`Seeding initial data for Firestore collection: ${collectionName} (${initialItems.length} items)...`);
      // Firestore batch limit is 500, use chunks of 300
      const chunkSize = 300;
      for (let i = 0; i < initialItems.length; i += chunkSize) {
        const chunk = initialItems.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((item) => {
          const itemDoc = doc(db, collectionName, item.id);
          const sanitized = cleanDataForFirestore(item);
          batch.set(itemDoc, { ...sanitized, syncedAt: new Date().toISOString() }, { merge: true });
        });
        await batch.commit();
      }
      console.log(`Seeded collection ${collectionName} successfully.`);
    }
    return initialItems;
  } catch (error) {
    console.warn(`Firestore sync note for ${collectionName}: using local cache.`, error);
    return initialItems;
  }
}

/**
 * Check if core Firestore collections have any data or system was already initialized
 */
export async function checkFirestoreHasData(): Promise<boolean> {
  try {
    // If the system has already been initialized, never auto-seed again (deletions must be respected)
    const alreadyInit = await isSystemAlreadyInitialized();
    if (alreadyInit) {
      return true;
    }

    const tenantsSnap = await getDocs(collection(db, 'tenants'));
    if (!tenantsSnap.empty) return true;
    const studentsSnap = await getDocs(collection(db, 'students'));
    if (!studentsSnap.empty) return true;
    const classesSnap = await getDocs(collection(db, 'classes'));
    if (!classesSnap.empty) return true;
    return false;
  } catch (e) {
    console.warn('Check Firestore data error:', e);
    return true; // Default to true on error so we don't accidentally overwrite with demo data
  }
}

/**
 * Push all application collections to Firestore in safe batches
 */
export async function pushAllDataToFirestore(
  collectionsMap: Record<string, any[]>
): Promise<{ success: boolean; totalWritten: number; collectionCounts: Record<string, number>; error?: string }> {
  let totalWritten = 0;
  const collectionCounts: Record<string, number> = {};

  try {
    for (const [collectionName, items] of Object.entries(collectionsMap)) {
      if (!items || items.length === 0) {
        collectionCounts[collectionName] = 0;
        continue;
      }

      const chunkSize = 250;
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((item) => {
          const docId = String(item.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`);
          const docRef = doc(db, collectionName, docId);
          const sanitized = cleanDataForFirestore(item);
          batch.set(docRef, { ...sanitized, updatedAt: new Date().toISOString() }, { merge: true });
        });
        await batch.commit();
      }

      collectionCounts[collectionName] = items.length;
      totalWritten += items.length;
      console.log(`Uploaded ${items.length} items to Firestore collection "${collectionName}"`);
    }

    // Write a system status record
    await setDoc(doc(db, '_system', 'sync_status'), {
      lastFullSyncAt: new Date().toISOString(),
      totalDocuments: totalWritten,
      collections: collectionCounts,
      status: 'success',
    }, { merge: true });

    await markSystemInitialized();

    return { success: true, totalWritten, collectionCounts };
  } catch (err: any) {
    console.error('pushAllDataToFirestore error:', err);
    return {
      success: false,
      totalWritten,
      collectionCounts,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Fetch document counts for all specified collections in Firestore
 */
export async function fetchCollectionCounts(
  collectionNames: string[]
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const name of collectionNames) {
    try {
      const snap = await getDocs(collection(db, name));
      counts[name] = snap.size;
    } catch {
      counts[name] = 0;
    }
  }
  return counts;
}

/**
 * Sync individual item save to Firestore
 */
export async function syncSaveToFirestore(collectionName: string, id: string, data: any) {
  try {
    await saveDocumentToFirestore(collectionName, id, data);
  } catch (err) {
    console.warn(`Failed to sync save ${collectionName}/${id} to Firestore:`, err);
  }
}

/**
 * Sync individual item delete to Firestore
 */
export async function syncDeleteFromFirestore(collectionName: string, id: string) {
  try {
    await deleteDocumentFromFirestore(collectionName, id);
  } catch (err) {
    console.warn(`Failed to sync delete ${collectionName}/${id} from Firestore:`, err);
  }
}

/**
 * Subscribe to real-time updates from a Firestore collection
 */
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (items: T[]) => void
): () => void {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...(docSnap.data() as T), id: docSnap.id });
        });
        onUpdate(items);
      },
      (error) => {
        console.warn(`Firestore real-time listener error for ${collectionName}:`, error);
      }
    );
  } catch (error) {
    console.warn(`Could not attach Firestore listener for ${collectionName}:`, error);
    return () => {};
  }
}

/**
 * Fetch all documents in a collection once
 */
export async function fetchCollectionFromFirestore<T extends { id: string }>(
  collectionName: string
): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const items: T[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ ...(docSnap.data() as T), id: docSnap.id });
    });
    return items;
  } catch (error) {
    console.warn(`Failed to fetch collection ${collectionName} from Firestore:`, error);
    return [];
  }
}

/**
 * Wipe all documents from specified Firestore collections
 */
export async function clearAllFirestoreCollections(collectionNames: string[]): Promise<void> {
  for (const name of collectionNames) {
    try {
      const colRef = collection(db, name);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
        console.log(`Cleared all documents in Firestore collection: ${name}`);
      }
    } catch (err) {
      console.warn(`Failed to clear Firestore collection ${name}:`, err);
    }
  }
}
