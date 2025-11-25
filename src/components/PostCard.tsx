'use client';

import { Post } from '@/types';
import { Star, User as UserIcon, Trash2, Bookmark, ThumbsUp, Heart, Smile, Frown, MessageCircle } from 'lucide-react';
import { APP_CONFIG } from '@/config/settings';
import { getUser } from '@/services/user';
import { deletePost } from '@/services/post';
import { savePost, unsavePost, isPostSaved } from '@/services/savedPost';
import { auth } from '@/lib/firebase';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
    const [isSaved, setIsSaved] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const currentUser = auth.currentUser;
    const isAuthor = currentUser?.uid === post.authorId;

    // Reactions state
    const [selectedReaction, setSelectedReaction] = useState<'like' | 'love' | 'haha' | 'sad' | null>(null);
    const [showReactions, setShowReactions] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    const reactions = [
        { id: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
        { id: 'love', icon: Heart, label: 'Love', color: 'text-red-500' },
        { id: 'haha', icon: Smile, label: 'Haha', color: 'text-yellow-500' },
        { id: 'sad', icon: Frown, label: 'Sad', color: 'text-yellow-600' },
    ] as const;

    const handleTouchStart = () => {
        longPressTimer.current = setTimeout(() => {
            setShowReactions(true);
        }, 500); // 500ms for long press
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleReactionSelect = (e: React.MouseEvent, reactionId: typeof reactions[number]['id']) => {
        e.stopPropagation();
        setSelectedReaction(selectedReaction === reactionId ? null : reactionId);
        setShowReactions(false);
    };

    const getReactionIcon = () => {
        if (!selectedReaction) return <ThumbsUp className="w-5 h-5" />;
        const reaction = reactions.find(r => r.id === selectedReaction);
        const Icon = reaction?.icon || ThumbsUp;
        return <Icon className={`w-5 h-5 ${reaction?.color} fill-current`} />;
    };

    const getReactionLabel = () => {
        if (!selectedReaction) return 'Like';
        const reaction = reactions.find(r => r.id === selectedReaction);
        return reaction?.label || 'Like';
    };

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
        fetchAuthor();
    }, [post.authorId]);

    useEffect(() => {
        const checkSavedStatus = async () => {
            if (currentUser) {
                const saved = await isPostSaved(currentUser.uid, post.id);
                setIsSaved(saved);
            }
        };
        checkSavedStatus();
    }, [currentUser, post.id]);

    const handleSaveToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) {
            alert("Please login to save posts");
            return;
        }
        if (saveLoading) return;

        setSaveLoading(true);
        try {
            if (isSaved) {
                await unsavePost(currentUser.uid, post.id);
                setIsSaved(false);
            } else {
                await savePost(currentUser.uid, post.id);
                setIsSaved(true);
            }
        } catch (error) {
            console.error("Error toggling save:", error);
        } finally {
            setSaveLoading(false);
        }
    };

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
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete post"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={handleSaveToggle}
                        disabled={saveLoading}
                        className={`p-2 rounded-full transition-colors ${isSaved ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        title={isSaved ? "Unsave" : "Save"}
                    >
                        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
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

            {/* Reactions and Comments Section */}
            <div className="px-4 pb-2">
                <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                    {/* Like / Reactions Button */}
                    <div
                        className="relative group"
                        onMouseLeave={() => setShowReactions(false)}
                    >
                        {/* Reactions Popup */}
                        <div className={`
                                absolute bottom-full left-0 pb-2 transition-all duration-200 origin-bottom-left z-10
                                ${showReactions ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
                            `}>
                            <div className="bg-white rounded-full shadow-lg border border-gray-100 p-1 flex gap-2">
                                {reactions.map((reaction) => (
                                    <button
                                        key={reaction.id}
                                        onClick={(e) => handleReactionSelect(e, reaction.id)}
                                        className="p-2 hover:bg-gray-50 rounded-full transition-transform hover:scale-110 focus:outline-none"
                                        title={reaction.label}
                                    >
                                        <reaction.icon className={`w-6 h-6 ${reaction.color} ${selectedReaction === reaction.id ? 'fill-current' : ''}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors ${selectedReaction ? reactions.find(r => r.id === selectedReaction)?.color : 'text-gray-600'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!selectedReaction) setSelectedReaction('like');
                                else setSelectedReaction(null);
                            }}
                            onMouseEnter={() => setShowReactions(true)}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            {getReactionIcon()}
                            <span className="font-medium">{getReactionLabel()}</span>
                        </button>
                    </div>

                    {/* Comment Button */}
                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                        }}
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">Comment</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
