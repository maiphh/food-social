'use client';

import { useState, useEffect, useRef } from 'react';
import { ThumbsUp, Heart, Smile, Frown, MessageCircle, Bookmark } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { savePost, unsavePost, isPostSaved } from '@/services/savedPost';
import { toggleReaction, getUserReactionOnPost, ReactionType } from '@/services/reaction';

interface PostActionsProps {
    postId: string;
    onCommentClick?: () => void;
    onReactionChange?: (oldReaction: ReactionType | null, newReaction: ReactionType | null) => void;
}

export default function PostActions({ postId, onCommentClick, onReactionChange }: PostActionsProps) {
    const currentUser = auth.currentUser;
    const [isSaved, setIsSaved] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [selectedReaction, setSelectedReaction] = useState<'like' | 'love' | 'haha' | 'sad' | null>(null);
    const [showReactions, setShowReactions] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    const reactions = [
        { id: 'like', icon: ThumbsUp, label: 'Like', color: 'text-blue-500' },
        { id: 'love', icon: Heart, label: 'Love', color: 'text-red-500' },
        { id: 'haha', icon: Smile, label: 'Haha', color: 'text-yellow-500' },
        { id: 'sad', icon: Frown, label: 'Sad', color: 'text-yellow-600' },
    ] as const;

    useEffect(() => {
        const loadPostData = async () => {
            if (currentUser) {
                // Check saved status
                const saved = await isPostSaved(currentUser.uid, postId);
                setIsSaved(saved);

                // Load user's reaction
                const userReaction = await getUserReactionOnPost(postId, currentUser.uid);
                if (userReaction) {
                    setSelectedReaction(userReaction.type);
                }
            }
        };
        loadPostData();
    }, [currentUser, postId]);

    const handleTouchStart = () => {
        longPressTimer.current = setTimeout(() => {
            setShowReactions(true);
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleReactionSelect = async (e: React.MouseEvent, reactionId: typeof reactions[number]['id']) => {
        e.stopPropagation();

        if (!currentUser) {
            alert("Please login to react to posts");
            return;
        }

        try {
            // If clicking the same reaction, toggle it off
            if (selectedReaction === reactionId) {
                if (onReactionChange) onReactionChange(selectedReaction, null);
                setSelectedReaction(null); // Optimistic update
                await toggleReaction(postId, currentUser.uid, reactionId);
            } else {
                // Otherwise, set the new reaction
                if (onReactionChange) onReactionChange(selectedReaction, reactionId);
                setSelectedReaction(reactionId); // Optimistic update
                await toggleReaction(postId, currentUser.uid, reactionId);
            }
            setShowReactions(false);
        } catch (error) {
            console.error("Error toggling reaction:", error);
        }
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
                await unsavePost(currentUser.uid, postId);
                setIsSaved(false);
            } else {
                await savePost(currentUser.uid, postId);
                setIsSaved(true);
            }
        } catch (error) {
            console.error("Error toggling save:", error);
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <div className="border-t border-gray-100 pt-2 flex items-center justify-around">
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
                    className={`p-2 rounded-lg hover:bg-gray-50 transition-colors ${selectedReaction ? reactions.find(r => r.id === selectedReaction)?.color : 'text-gray-600'}`}
                    onClick={async (e) => {
                        e.stopPropagation();

                        if (!currentUser) {
                            alert("Please login to react to posts");
                            return;
                        }

                        try {
                            if (!selectedReaction) {
                                // Add 'like' reaction
                                if (onReactionChange) onReactionChange(null, 'like');
                                setSelectedReaction('like'); // Optimistic update
                                await toggleReaction(postId, currentUser.uid, 'like');
                            } else {
                                // Remove current reaction
                                if (onReactionChange) onReactionChange(selectedReaction, null);
                                setSelectedReaction(null); // Optimistic update
                                await toggleReaction(postId, currentUser.uid, selectedReaction);
                            }
                        } catch (error) {
                            console.error("Error toggling reaction:", error);
                        }
                    }}
                    onMouseEnter={() => setShowReactions(true)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    title={getReactionLabel()}
                >
                    {getReactionIcon()}
                </button>
            </div>

            {/* Comment Button */}
            <button
                className="p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    if (onCommentClick) onCommentClick();
                }}
                title="Comment"
            >
                <MessageCircle className="w-5 h-5" />
            </button>

            {/* Save Button */}
            <button
                onClick={handleSaveToggle}
                disabled={saveLoading}
                className={`p-2 rounded-lg transition-colors ${isSaved ? 'text-blue-500 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                title={isSaved ? "Unsave" : "Save"}
            >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
        </div>
    );
}
