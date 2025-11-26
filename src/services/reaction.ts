import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    getDoc,
    updateDoc,
    increment
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ReactionType = 'like' | 'love' | 'haha' | 'sad';

export interface Reaction {
    id?: string;
    postId: string;
    userId: string;
    type: ReactionType;
    createdAt: string;
}

/**
 * Add a reaction to a post
 * @param postId - The ID of the post to react to
 * @param userId - The ID of the user reacting
 * @param type - The type of reaction (like, love, haha, sad)
 */
export const addReaction = async (
    postId: string,
    userId: string,
    type: ReactionType
): Promise<string> => {
    try {
        // First check if user already has a reaction on this post
        const existingReaction = await getUserReactionOnPost(postId, userId);

        // If user already reacted, remove the old reaction first
        if (existingReaction) {
            await removeReaction(existingReaction.id!);
        }

        // Add the new reaction
        const reactionData: Omit<Reaction, "id"> = {
            postId,
            userId,
            type,
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, "reactions"), reactionData);

        // Update post reaction count
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, {
            [`reactionCount.${type}`]: increment(1)
        });

        return docRef.id;
    } catch (error) {
        console.error("Error adding reaction: ", error);
        throw error;
    }
};

/**
 * Remove a reaction by ID
 * @param reactionId - The ID of the reaction to remove
 */
export const removeReaction = async (reactionId: string): Promise<void> => {
    try {
        const reactionRef = doc(db, "reactions", reactionId);
        const reactionSnap = await getDoc(reactionRef);

        if (reactionSnap.exists()) {
            const reactionData = reactionSnap.data() as Reaction;
            await deleteDoc(reactionRef);

            // Decrement post reaction count
            const postRef = doc(db, "posts", reactionData.postId);
            await updateDoc(postRef, {
                [`reactionCount.${reactionData.type}`]: increment(-1)
            });
        }
    } catch (error) {
        console.error("Error removing reaction: ", error);
        throw error;
    }
};

/**
 * Get a user's reaction on a specific post
 * @param postId - The ID of the post
 * @param userId - The ID of the user
 * @returns The user's reaction, or null if they haven't reacted
 */
export const getUserReactionOnPost = async (
    postId: string,
    userId: string
): Promise<Reaction | null> => {
    try {
        const q = query(
            collection(db, "reactions"),
            where("postId", "==", postId),
            where("userId", "==", userId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Reaction;
    } catch (error) {
        console.error("Error getting user reaction: ", error);
        throw error;
    }
};

/**
 * Get all reactions for a post
 * @param postId - The ID of the post
 * @returns Array of reactions for the post
 */
export const getPostReactions = async (postId: string): Promise<Reaction[]> => {
    try {
        const q = query(
            collection(db, "reactions"),
            where("postId", "==", postId)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        } as Reaction));
    } catch (error) {
        console.error("Error getting post reactions: ", error);
        throw error;
    }
};

/**
 * Get reaction counts for a post, grouped by type
 * @param postId - The ID of the post
 * @returns Object with counts for each reaction type
 */
export const getReactionCounts = async (postId: string): Promise<Record<ReactionType, number>> => {
    try {
        const reactions = await getPostReactions(postId);

        const counts: Record<ReactionType, number> = {
            like: 0,
            love: 0,
            haha: 0,
            sad: 0
        };

        reactions.forEach((reaction) => {
            counts[reaction.type]++;
        });

        return counts;
    } catch (error) {
        console.error("Error getting reaction counts: ", error);
        throw error;
    }
};

/**
 * Toggle a reaction on a post (add if not exists, remove if exists)
 * @param postId - The ID of the post
 * @param userId - The ID of the user
 * @param type - The type of reaction
 * @returns true if reaction was added, false if it was removed
 */
export const toggleReaction = async (
    postId: string,
    userId: string,
    type: ReactionType
): Promise<boolean> => {
    try {
        const existingReaction = await getUserReactionOnPost(postId, userId);

        if (existingReaction) {
            // If same reaction type, remove it
            if (existingReaction.type === type) {
                await removeReaction(existingReaction.id!);
                return false;
            }
            // If different reaction type, update it
            else {
                await removeReaction(existingReaction.id!);
                await addReaction(postId, userId, type);
                return true;
            }
        } else {
            // No existing reaction, add new one
            await addReaction(postId, userId, type);
            return true;
        }
    } catch (error) {
        console.error("Error toggling reaction: ", error);
        throw error;
    }
};

/**
 * Calculate total number of reactions from reaction counts object
 * @param reactionCount - The reaction counts object
 * @returns Total number of reactions
 */
export const calculateTotalReactions = (reactionCount?: Record<string, number>): number => {
    if (!reactionCount) return 0;
    return Object.values(reactionCount).reduce((sum, count) => sum + count, 0);
};
