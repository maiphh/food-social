import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    DocumentData,
} from "firebase/firestore";
import { User } from "@/types";

// Collection reference
const usersCollectionRef = collection(db, "users");

// Create
export const addUser = async (data: User) => {
    try {
        const docRef = await addDoc(usersCollectionRef, data);
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

// Read All
export const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(usersCollectionRef);
        const users = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as User[];
        return users;
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw e;
    }
};

// Read One
export const getUser = async (id: string) => {
    try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as User;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (e) {
        console.error("Error getting document: ", e);
        throw e;
    }
};

// Update
export const updateUser = async (id: string, data: Partial<User>) => {
    try {
        const docRef = doc(db, "users", id);
        await updateDoc(docRef, data as DocumentData);
        console.log("Document updated");
    } catch (e) {
        console.error("Error updating document: ", e);
        throw e;
    }
};

// Delete
export const deleteUser = async (id: string) => {
    try {
        const docRef = doc(db, "users", id);
        await deleteDoc(docRef);
        console.log("Document deleted");
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw e;
    }
};
