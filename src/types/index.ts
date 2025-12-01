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
        overall: number;
    };
    images: string[];
    visibility: 'public' | 'private' | 'group';
    groupId?: string;
    createdAt: number;
    commentCount?: number;
    reactionCount?: Record<string, number>;
    address?: string;
    priceMin?: number;
    priceMax?: number;
    recommendation?: 'not-recommend' | 'recommend' | 'highly-recommend';
}

export enum GroupRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    MEMBER = 'member'
}

export interface Group {
    id: string;
    name: string;
    ownerId: string;
    members: string[];
    roles: Record<string, GroupRole>;
    isPrivate: boolean;
    imageUrl?: string;
}

export interface Reply {
    replyId: string;
    userId: string;
    text: string;
    createdAt: string; // ISO 8601 string
}

export interface Comment {
    commentId: string;
    postId: string;
    userId: string;
    userDisplayName: string;
    userPhotoUrl?: string;
    content: string;
    createdAt: string; // ISO 8601 string
    replies: Reply[];
}
