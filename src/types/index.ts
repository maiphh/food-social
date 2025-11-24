export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    following: string[];
}

export interface Post {
    id: string;
    authorId: string;
    content: string;
    ratings: {
        food: number;
        ambiance: number;
    };
    images: string[];
    visibility: 'public' | 'private' | 'group';
    groupId?: string;
    createdAt: number;
}

export interface Group {
    id: string;
    name: string;
    ownerId: string;
    members: string[];
    isPrivate: boolean;
}
