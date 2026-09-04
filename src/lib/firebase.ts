import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  uploadString,
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with databaseId as specified in config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app, firebaseConfig.storageBucket || undefined);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Remove undefined values and deeply sanitize data for Firestore
 */
export function cleanDataForFirestore<T>(data: T): T {
  if (data === undefined || data === null) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => cleanDataForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        result[key] = cleanDataForFirestore(value);
      }
    }
    return result as T;
  }
  return data;
}

// Connection test helper
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    const testDocRef = doc(db, 'test', 'connection');
    await setDoc(testDocRef, {
      status: 'online',
      projectId: firebaseConfig.projectId,
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId,
      lastPing: new Date().toISOString(),
    }, { merge: true });
    console.log('Firebase Cloud Firestore connection active & verified.');
    return true;
  } catch (error) {
    console.warn('Firebase Cloud Firestore connection note:', error);
    return false;
  }
}

/**
 * Upload a File object directly to Firebase Cloud Storage.
 * Returns public download URL. Falls back to base64 data-url if offline.
 */
export async function uploadFileToFirebaseStorage(
  file: File,
  folderPath: string = 'uploads'
): Promise<string> {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fullPath = `${folderPath}/${timestamp}_${sanitizedName}`;

  try {
    const fileRef = storageRef(storage, fullPath);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Uploaded to Cloud Storage:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.warn('Firebase Storage direct upload fallback to Base64 data-url:', error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Upload a Base64 data-url string to Firebase Cloud Storage.
 * Returns public download URL.
 */
export async function uploadBase64ToFirebaseStorage(
  base64Data: string,
  fileName: string = 'image.png',
  folderPath: string = 'homeworks'
): Promise<string> {
  if (!base64Data.startsWith('data:')) {
    return base64Data; // already a remote URL
  }

  const timestamp = Date.now();
  const fullPath = `${folderPath}/${timestamp}_${fileName}`;

  try {
    const fileRef = storageRef(storage, fullPath);
    const snapshot = await uploadString(fileRef, base64Data, 'data_url');
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.warn('Firebase Storage uploadString fallback:', error);
    return base64Data;
  }
}

/**
 * Helper to save an item to Firestore collection
 */
export async function saveDocumentToFirestore(collectionName: string, docId: string, data: any) {
  try {
    const docRef = doc(db, collectionName, docId);
    const sanitized = cleanDataForFirestore(data);
    await setDoc(docRef, { ...sanitized, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

/**
 * Helper to delete an item from Firestore collection
 */
export async function deleteDocumentFromFirestore(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}
