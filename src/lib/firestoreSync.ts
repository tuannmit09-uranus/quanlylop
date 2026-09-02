import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db, saveDocumentToFirestore, deleteDocumentFromFirestore, OperationType, handleFirestoreError } from './firebase';

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
      const batch = writeBatch(db);
      initialItems.forEach((item) => {
        const itemDoc = doc(db, collectionName, item.id);
        batch.set(itemDoc, { ...item, syncedAt: new Date().toISOString() });
      });
      await batch.commit();
      console.log(`Seeded collection ${collectionName} successfully.`);
    }
    return initialItems;
  } catch (error) {
    console.warn(`Firestore sync note for ${collectionName}: using local cache.`, error);
    return initialItems;
  }
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
