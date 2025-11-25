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

export interface Reply {
    reply_id: string;
    user_id: string;
    text: string;
    created_at: string; // ISO 8601 string
}

export interface Comment {
    comment_id: string;
    post_id: string;
    user_id: string;
    user_display_name: string;
    user_photo_url?: string;
    content: string;
    created_at: string; // ISO 8601 string
    replies: Reply[];
}
