import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION_NAME = "saved_posts";

export const savePost = async (userId: string, postId: string) => {
    const docRef = doc(db, COLLECTION_NAME, userId);

    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await updateDoc(docRef, {
                posts: arrayUnion(postId)
            });
        } else {
            await setDoc(docRef, {
                posts: [postId]
            });
        }
    } catch (error) {
        console.error("Error saving post:", error);
        throw error;
    }
};

export const unsavePost = async (userId: string, postId: string) => {
    const docRef = doc(db, COLLECTION_NAME, userId);

    try {
        await updateDoc(docRef, {
            posts: arrayRemove(postId)
        });
    } catch (error) {
        console.error("Error unsaving post:", error);
        throw error;
    }
};

export const isPostSaved = async (userId: string, postId: string): Promise<boolean> => {
    const docRef = doc(db, COLLECTION_NAME, userId);

    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.posts?.includes(postId) || false;
        }
        return false;
    } catch (error) {
        console.error("Error checking saved post:", error);
        return false;
    }
};

export const getSavedPosts = async (userId: string): Promise<string[]> => {
    const docRef = doc(db, COLLECTION_NAME, userId);

    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().posts || [];
        }
        return [];
    } catch (error) {
        console.error("Error getting saved posts:", error);
        throw error;
    }
};
