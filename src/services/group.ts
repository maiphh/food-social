import {
    collection,
    addDoc,
    doc,
    updateDoc,
    arrayUnion
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Group } from "@/types";

export const createGroup = async (groupData: Omit<Group, "id">) => {
    try {
        const docRef = await addDoc(collection(db, "groups"), groupData);
        return docRef.id;
    } catch (error) {
        console.error("Error creating group: ", error);
        throw error;
    }
};

export const joinGroup = async (groupId: string, userId: string) => {
    const groupRef = doc(db, "groups", groupId);

    try {
        await updateDoc(groupRef, {
            members: arrayUnion(userId)
        });
    } catch (error) {
        console.error("Error joining group: ", error);
        throw error;
    }
};
