import {
    collection,
    addDoc,
    doc,
    updateDoc,
    arrayUnion,
    query,
    where,
    getDocs,
    getDoc,
    deleteDoc,
    arrayRemove,
    deleteField
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Group, GroupRole, User } from "@/types";


export const createGroup = async (groupData: Omit<Group, "id" | "roles">) => {
    try {
        const roles = {
            [groupData.ownerId]: GroupRole.OWNER
        };

        const docRef = await addDoc(collection(db, "groups"), {
            ...groupData,
            roles
        });
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
            members: arrayUnion(userId),
            [`roles.${userId}`]: GroupRole.MEMBER
        });
    } catch (error) {
        console.error("Error joining group: ", error);
        throw error;
    }
};

export const makeAdmin = async (groupId: string, userId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");

    const group = await getGroup(groupId);
    if (!group) throw new Error("Group not found");

    const currentUserRole = group.roles[currentUser.uid];
    if (currentUserRole !== GroupRole.OWNER) {
        throw new Error("Only the owner can make admins");
    }

    const groupRef = doc(db, "groups", groupId);
    try {
        await updateDoc(groupRef, {
            [`roles.${userId}`]: GroupRole.ADMIN
        });
    } catch (error) {
        console.error("Error making admin: ", error);
        throw error;
    }
};

export const getMembers = async (groupId: string): Promise<{ user: User, role: GroupRole }[]> => {
    const group = await getGroup(groupId);
    if (!group) throw new Error("Group not found");

    try {
        // In a real app with many members, we would paginate this or store denormalized user data.
        // For now, fetching all member profiles.
        const memberPromises = group.members.map(async (memberId) => {
            const userDoc = await getDoc(doc(db, "users", memberId));
            if (userDoc.exists()) {
                return {
                    user: { uid: userDoc.id, ...userDoc.data() } as User,
                    role: group.roles[memberId] || GroupRole.MEMBER
                };
            }
            return null;
        });

        const results = await Promise.all(memberPromises);
        return results.filter((item): item is { user: User, role: GroupRole } => item !== null);
    } catch (error) {
        console.error("Error fetching members: ", error);
        throw error;
    }
};

export const getMembersByRole = async (groupId: string, role: GroupRole): Promise<{ user: User, role: GroupRole }[]> => {
    const allMembers = await getMembers(groupId);
    return allMembers.filter(member => member.role === role);
};

export const addMember = async (groupId: string, userId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");

    const group = await getGroup(groupId);
    if (!group) throw new Error("Group not found");

    const currentUserRole = group.roles[currentUser.uid];
    if (currentUserRole !== GroupRole.OWNER && currentUserRole !== GroupRole.ADMIN) {
        throw new Error("Only admins or owners can add members");
    }

    await joinGroup(groupId, userId);
};

export const removeMember = async (groupId: string, userId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");

    const group = await getGroup(groupId);
    if (!group) throw new Error("Group not found");

    const currentUserRole = group.roles[currentUser.uid];
    // Owner can remove anyone. Admin can remove members but not other admins/owner.
    // Self-removal (leave) should be allowed via leaveGroup, but this is removeMember (kick).

    if (currentUserRole !== GroupRole.OWNER && currentUserRole !== GroupRole.ADMIN) {
        throw new Error("Only admins or owners can remove members");
    }

    const targetUserRole = group.roles[userId];
    if (currentUserRole === GroupRole.ADMIN && (targetUserRole === GroupRole.ADMIN || targetUserRole === GroupRole.OWNER)) {
        throw new Error("Admins cannot remove other admins or the owner");
    }

    const groupRef = doc(db, "groups", groupId);
    try {
        await updateDoc(groupRef, {
            members: arrayRemove(userId),
            [`roles.${userId}`]: deleteField()
        });
    } catch (error) {
        console.error("Error removing member: ", error);
        throw error;
    }
};

export const getUserGroups = async (userId: string): Promise<Group[]> => {
    try {
        const q = query(
            collection(db, "groups"),
            where("members", "array-contains", userId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
    } catch (error) {
        console.error("Error fetching user groups: ", error);
        throw error;
    }
};

export const getGroup = async (groupId: string): Promise<Group | null> => {
    try {
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Group;
        }
        return null;
    } catch (error) {
        console.error("Error fetching group: ", error);
        throw error;
    }
};

export const deleteGroup = async (groupId: string) => {
    try {
        await deleteDoc(doc(db, "groups", groupId));
    } catch (error) {
        console.error("Error deleting group: ", error);
        throw error;
    }
};

export const leaveGroup = async (groupId: string, userId: string) => {
    try {
        const groupRef = doc(db, "groups", groupId);
        await updateDoc(groupRef, {
            members: arrayRemove(userId)
        });
    } catch (error) {
        console.error("Error leaving group: ", error);
        throw error;
    }
};
