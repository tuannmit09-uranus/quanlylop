import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db, saveDocumentToFirestore, deleteDocumentFromFirestore, cleanDataForFirestore, OperationType, handleFirestoreError } from './firebase';

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
 * Check if core Firestore collections have any data
 */
export async function checkFirestoreHasData(): Promise<boolean> {
  try {
    const tenantsSnap = await getDocs(collection(db, 'tenants'));
    if (!tenantsSnap.empty) return true;
    const studentsSnap = await getDocs(collection(db, 'students'));
    if (!studentsSnap.empty) return true;
    const classesSnap = await getDocs(collection(db, 'classes'));
    if (!classesSnap.empty) return true;
    return false;
  } catch (e) {
    console.warn('Check Firestore data error:', e);
    return false;
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
