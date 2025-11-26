'use client';

import { useState, useEffect } from 'react';
import { Post, User } from '@/types';
import { ChevronLeft, ChevronRight, Star, User as UserIcon, ThumbsUp, Heart, Smile, Frown } from 'lucide-react';
import PostActions from './PostActions';
import { calculateTotalReactions, ReactionType } from '@/services/reaction';

interface PostDetailProps {
    post: Post;
    author: User | null;
    onAuthorClick?: () => void;
    onCommentClick?: () => void;
}

export default function PostDetail({ post, author, onAuthorClick, onCommentClick }: PostDetailProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(post.reactionCount || {});
    const [commentCount, setCommentCount] = useState(post.commentCount || 0);

    // Sync state with props
    useEffect(() => {
        setReactionCounts(post.reactionCount || {});
        setCommentCount(post.commentCount || 0);
    }, [post.reactionCount, post.commentCount]);

    const handleReactionChange = (oldReaction: ReactionType | null, newReaction: ReactionType | null) => {
        setReactionCounts(prev => {
            const newCounts = { ...prev };

            if (oldReaction) {
                newCounts[oldReaction] = Math.max(0, (newCounts[oldReaction] || 0) - 1);
            }

            if (newReaction) {
                newCounts[newReaction] = (newCounts[newReaction] || 0) + 1;
            }

            return newCounts;
        });
    };

    const reactionsConfig = [
        { id: 'like', icon: ThumbsUp, color: 'text-blue-500', fill: 'fill-blue-500' },
        { id: 'love', icon: Heart, color: 'text-red-500', fill: 'fill-red-500' },
        { id: 'haha', icon: Smile, color: 'text-yellow-500', fill: 'fill-yellow-500' },
        { id: 'sad', icon: Frown, color: 'text-yellow-600', fill: 'fill-yellow-600' },
    ] as const;

    const nextImage = () => {
        if (post?.images) {
            setCurrentImageIndex((prev) => (prev + 1) % post.images!.length);
        }
    };

    const prevImage = () => {
        if (post?.images) {
            setCurrentImageIndex((prev) => (prev - 1 + post.images!.length) % post.images!.length);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Image Carousel */}
            {post.images && post.images.length > 0 && (
                <div className="relative aspect-square bg-gray-100">
                    <img
                        src={post.images[currentImageIndex]}
                        alt={`Post image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                    />

                    {post.images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {post.images.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="p-4">
                {/* Author Info */}
                <div
                    className={`flex items-center gap-3 mb-4 ${onAuthorClick ? 'cursor-pointer' : ''}`}
                    onClick={onAuthorClick}
                >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                        {author?.photoURL ? (
                            <img src={author.photoURL} alt={author.displayName || 'User'} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-gray-900">{author?.displayName || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}
                        </p>
                    </div>
                </div>

                {/* Ratings */}
                <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-600">Food</span>
                        <div className="flex items-center text-yellow-400">
                            <span className="font-bold ml-1 text-gray-900">{post.ratings.food}</span>
                            <Star className="w-3 h-3 fill-current ml-0.5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-gray-600">Ambiance</span>
                        <div className="flex items-center text-yellow-400">
                            <span className="font-bold ml-1 text-gray-900">{post.ratings.ambiance}</span>
                            <Star className="w-3 h-3 fill-current ml-0.5" />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </p>
            </div>

            {/* Reaction and Comment Counts */}
            <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-gray-50">
                <div className="flex items-center gap-1 group/reactions relative">
                    {/* Reaction Icons */}
                    <div className="flex -space-x-1 mr-1">
                        {reactionsConfig.map((reaction) => {
                            const count = reactionCounts[reaction.id] || 0;
                            if (count > 0) {
                                return (
                                    <div key={reaction.id} className="bg-white rounded-full p-0.5 z-10">
                                        <reaction.icon className={`w-4 h-4 ${reaction.color} ${reaction.fill}`} />
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>

                    {/* Total Reactions */}
                    <span className="cursor-pointer hover:underline">
                        {calculateTotalReactions(reactionCounts)} reactions
                    </span>

                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover/reactions:block bg-white shadow-lg rounded-lg p-2 border border-gray-100 z-20 min-w-[150px]">
                        <div className="flex flex-col gap-1">
                            {Object.entries(reactionCounts).map(([type, count]) => (
                                count > 0 && (
                                    <div key={type} className="flex items-center justify-between gap-4">
                                        <span className="capitalize">{type}</span>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                )
                            ))}
                            {calculateTotalReactions(reactionCounts) === 0 && (
                                <span className="text-xs text-gray-400">No reactions yet</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comment Count */}
                <div>
                    {commentCount} comments
                </div>
            </div>

            {/* Post Actions */}
            <div className="px-4 pb-2">
                <PostActions
                    postId={post.id}
                    onCommentClick={onCommentClick}
                    onReactionChange={handleReactionChange}
                />
            </div>
        </div>
    );
}
