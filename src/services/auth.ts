import {
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    signInAnonymously,
    signOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "./user";

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Create/Update user profile in Firestore
        await createUserProfile({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            following: [],
        });

        return user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const signInWithFacebook = async () => {
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        const user = result.user;

        // Create/Update user profile in Firestore
        await createUserProfile({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            following: [],
        });

        return user;
    } catch (error) {
        console.error("Error signing in with Facebook", error);
        throw error;
    }
};

export const signInAsGuest = async () => {
    try {
        const result = await signInAnonymously(auth);
        const user = result.user;

        // Create/Update user profile in Firestore for guest
        await createUserProfile({
            uid: user.uid,
            displayName: "Guest User",
            email: null,
            photoURL: null,
            following: [],
        });

        return user;
    } catch (error) {
        console.error("Error signing in anonymously", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};
