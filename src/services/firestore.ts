import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserProfile, Benefit, Bookmark } from '../types';

// Users
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const createUserProfile = async (uid: string, profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateUserProfile = async (uid: string, profile: Partial<Omit<UserProfile, 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    ...profile,
    updatedAt: serverTimestamp(),
  });
};

// Benefits
export const getAllBenefits = async (): Promise<Benefit[]> => {
  const q = query(collection(db, 'benefits'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Benefit[];
};

export const getBenefit = async (id: string): Promise<Benefit | null> => {
  const docRef = doc(db, 'benefits', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Benefit;
  }
  return null;
};

export const createBenefit = async (benefit: Omit<Benefit, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    console.log('Creating benefit:', benefit);
    const docRef = await addDoc(collection(db, 'benefits'), {
      ...benefit,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('Benefit created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating benefit:', error);
    throw error;
  }
};

export const updateBenefit = async (id: string, benefit: Partial<Omit<Benefit, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    console.log('Updating benefit:', id, benefit);
    const docRef = doc(db, 'benefits', id);
    await updateDoc(docRef, {
      ...benefit,
      updatedAt: serverTimestamp(),
    });
    console.log('Benefit updated:', id);
  } catch (error) {
    console.error('Error updating benefit:', error);
    throw error;
  }
};

export const deleteBenefit = async (id: string): Promise<void> => {
  const docRef = doc(db, 'benefits', id);
  await deleteDoc(docRef);
};

// Bookmarks
export const getUserBookmarks = async (uid: string): Promise<Bookmark[]> => {
  const q = query(collection(db, 'users', uid, 'bookmarks'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    benefitId: doc.id,
    ...doc.data(),
  })) as Bookmark[];
};

export const addBookmark = async (uid: string, benefitId: string): Promise<void> => {
  const docRef = doc(db, 'users', uid, 'bookmarks', benefitId);
  await setDoc(docRef, {
    benefitId,
    createdAt: serverTimestamp(),
  });
};

export const removeBookmark = async (uid: string, benefitId: string): Promise<void> => {
  const docRef = doc(db, 'users', uid, 'bookmarks', benefitId);
  await deleteDoc(docRef);
};

export const isBookmarked = async (uid: string, benefitId: string): Promise<boolean> => {
  const docRef = doc(db, 'users', uid, 'bookmarks', benefitId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};

