import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Post } from '@/types';

// Collection Reference Helper
const postCollection = collection(db, 'posts');

// 1. Create
export const createPost = async (postData: Omit<Post, 'id'>) => {
    try {
        const docRef = await addDoc(postCollection, {
            ...postData,
            createdAt: Date.now(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating post:", error);
        return { success: false, error };
    }
};

// 2. Read (Public Feed)
export const getPublicFeed = async () => {
    try {
        const q = query(
            postCollection,
            where("visibility", "==", "public"),
            orderBy("createdAt", "desc"),
            limit(20)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    } catch (error) {
        console.error("Error getting public feed:", error);
        return [];
    }
};
