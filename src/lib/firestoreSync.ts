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
