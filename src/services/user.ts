import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { User } from "@/types";

export const getUser = async (uid: string): Promise<User | null> => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
        return userDoc.data() as User;
    }
    return null;
};



export const createUserProfile = async (user: User) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, user);
    }
};

export const changeUserName = async (uid: string, name: string) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { displayName: name });
    if (auth.currentUser && auth.currentUser.uid === uid) {
        await updateProfile(auth.currentUser, { displayName: name });
    }
};

export const changePfp = async (uid: string, pfp: string) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { photoURL: pfp });
    if (auth.currentUser && auth.currentUser.uid === uid) {
        await updateProfile(auth.currentUser, { photoURL: pfp });
    }
};
