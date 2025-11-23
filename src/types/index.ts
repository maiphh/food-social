export interface User {
    id?: string;
    name: string;
    email: string;
    createdAt: any; // Using any for Firestore Timestamp compatibility for now, or Date
    updatedAt?: any;
}

export interface Post {
    id?: string;
    authorId: string;
    content: string;
    images: string[];
    ratings: { food: number; ambiance: number };
    visibility: 'public' | 'private' | 'group';
    groupId?: string;
    createdAt: number; // Use Milliseconds (Date.now()) for easy sorting
}

export interface Group {
    id?: string;
    name: string;
    members: string[];
    createdAt: number;
}
