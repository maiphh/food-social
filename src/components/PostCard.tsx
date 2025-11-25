'use client';

import { Post } from '@/types';
import { Star, User as UserIcon, Trash2, MoreVertical, Edit2 } from 'lucide-react';
import { APP_CONFIG } from '@/config/settings';
import { getUser } from '@/services/user';
import { deletePost } from '@/services/post';
import { auth } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostActions from './PostActions';

interface PostCardProps {
    post: Post;
    onDelete?: () => void;
    onClick?: () => void;
}

export default function PostCard({ post, onDelete, onClick }: PostCardProps) {
    const router = useRouter();
    const [authorName, setAuthorName] = useState<string>('Loading...');
    const [authorPhoto, setAuthorPhoto] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const currentUser = auth.currentUser;
    const isAuthor = currentUser?.uid === post.authorId;
    const [showMenu, setShowMenu] = useState(false);

    // Fetch author's display name and photo
    useEffect(() => {
        const fetchAuthor = async () => {
            try {
                const user = await getUser(post.authorId);
                setAuthorName(user?.displayName || 'Unknown User');
                setAuthorPhoto(user?.photoURL || null);
            } catch (error) {
                console.error('Error fetching user:', error);
                setAuthorName('Unknown User');
                setAuthorPhoto(null);
            }
        };

        fetchAuthor();
    }, [post.authorId]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        setIsDeleting(true);
        try {
            await deletePost(post.id);
            if (onDelete) onDelete();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.push(`/${post.authorId}/${post.id}`);
        }
    };

    // Helper to render stars
    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 relative group cursor-pointer hover:shadow-md transition-shadow"
        >
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                            {authorPhoto ? (
                                <img src={authorPhoto} alt={authorName} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">{authorName}</div>
                            <div className="text-xs text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {isAuthor && (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                title="Options"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-40 z-10">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                            // TODO: Implement edit functionality
                                            alert('Edit functionality coming soon!');
                                        }}
                                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                            handleDelete();
                                        }}
                                        disabled={isDeleting}
                                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

                {post.images && post.images.length > 0 ? (
                    <div className="mb-4 rounded-lg overflow-hidden bg-gray-100 aspect-video relative">
                        <img
                            src={post.images[0]}
                            alt="Post content"
                            className="w-full h-full object-cover"
                        />
                        {post.images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                +{post.images.length - 1}
                            </div>
                        )}
                    </div>
                ) : null}

                <div className="flex gap-4 flex-wrap">
                    {APP_CONFIG.ratingCategories.map((category) => (
                        <div key={category.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <span className="text-sm font-medium text-gray-600">{category.label}</span>
                            {renderStars(post.ratings[category.id as keyof typeof post.ratings] || 0)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Post Actions */}
            <div className="px-4 pb-2">
                <PostActions
                    postId={post.id}
                    onCommentClick={handleClick}
                />
            </div>
        </div>
    );
}
