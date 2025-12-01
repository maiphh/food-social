import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    deleteDoc,
    doc,
    getDoc,
    updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/types";

export const createPost = async (postData: Omit<Post, "id">) => {
    try {
        const docRef = await addDoc(collection(db, "posts"), postData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding post: ", error);
        throw error;
    }
};

export const updatePost = async (postId: string, postData: Partial<Omit<Post, "id">>) => {
    try {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, postData);
        return postId;
    } catch (error) {
        console.error("Error updating post: ", error);
        throw error;
    }
};

export const deletePost = async (postId: string) => {
    try {
        await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
        console.error("Error deleting post: ", error);
        throw error;
    }
};

export const getPublicFeed = async (): Promise<Post[]> => {
    const q = query(
        collection(db, "posts"),
        where("visibility", "==", "public"),
        orderBy("createdAt", "desc"),
        limit(20)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
};

export const getUserPosts = async (authorId: string): Promise<Post[]> => {
    const q = query(
        collection(db, "posts"),
        where("authorId", "==", authorId),
        orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
};

export const getPost = async (postId: string): Promise<Post | null> => {
    const docRef = doc(db, "posts", postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Post;
    } else {
        return null;
    }
};

export const getGroupPosts = async (groupId: string): Promise<Post[]> => {
    const q = query(
        collection(db, "posts"),
        where("groupId", "==", groupId),
        orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
};
