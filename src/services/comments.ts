import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    getDoc,
    query,
    where,
    orderBy,
    getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Comment, Reply } from "@/types";

export const createComment = async (data: Omit<Comment, "commentId" | "replies" | "createdAt">) => {
    try {
        const commentData = {
            ...data,
            createdAt: new Date().toISOString(),
            replies: []
        };
        const docRef = await addDoc(collection(db, "comments"), commentData);

        // Update the document with its own ID as commentId
        await updateDoc(docRef, {
            commentId: docRef.id
        });

        return docRef.id;
    } catch (error) {
        console.error("Error creating comment: ", error);
        throw error;
    }
};

export const deleteComment = async (commentId: string) => {
    try {
        await deleteDoc(doc(db, "comments", commentId));
    } catch (error) {
        console.error("Error deleting comment: ", error);
        throw error;
    }
};

export const replyComment = async (commentId: string, replyData: Omit<Reply, "replyId" | "createdAt">) => {
    try {
        const reply: Reply = {
            ...replyData,
            replyId: crypto.randomUUID(), // Generate a unique ID for the reply
            createdAt: new Date().toISOString()
        };

        const commentRef = doc(db, "comments", commentId);
        await updateDoc(commentRef, {
            replies: arrayUnion(reply)
        });

        return reply.replyId;
    } catch (error) {
        console.error("Error replying to comment: ", error);
        throw error;
    }
};

export const deleteReply = async (commentId: string, replyId: string) => {
    try {
        const commentRef = doc(db, "comments", commentId);
        const commentSnap = await getDoc(commentRef);

        if (commentSnap.exists()) {
            const commentData = commentSnap.data() as Comment;
            const replyToRemove = commentData.replies.find(r => r.replyId === replyId);

            if (replyToRemove) {
                await updateDoc(commentRef, {
                    replies: arrayRemove(replyToRemove)
                });
            } else {
                console.warn(`Reply with ID ${replyId} not found in comment ${commentId}`);
            }
        } else {
            throw new Error("Comment not found");
        }
    } catch (error) {
        console.error("Error deleting reply: ", error);
        throw error;
    }
};

export const getComments = async (postId: string): Promise<Comment[]> => {
    try {
        const q = query(
            collection(db, "comments"),
            where("postId", "==", postId),
            orderBy("createdAt", "asc") // Oldest comments first? Or desc? Usually comments are chronological.
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ ...doc.data() } as Comment));
    } catch (error) {
        console.error("Error getting comments: ", error);
        throw error;
    }
};
