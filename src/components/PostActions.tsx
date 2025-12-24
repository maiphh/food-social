'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Bookmark } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { savePost, unsavePost, isPostSaved } from '@/services/savedPost';
import { toggleReaction, getUserReactionOnPost, ReactionType } from '@/services/reaction';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/config/settings';
import { cn } from '@/lib/utils';

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
    const hideTimer = useRef<NodeJS.Timeout | null>(null);

    const reactions = APP_CONFIG.reactions;

    useEffect(() => {
        const loadPostData = async () => {
            if (currentUser) {
                const saved = await isPostSaved(currentUser.uid, postId);
                setIsSaved(saved);
                const userReaction = await getUserReactionOnPost(postId, currentUser.uid);
                if (userReaction) setSelectedReaction(userReaction.type);
            }
        };
        loadPostData();
    }, [currentUser, postId]);

    const handleMouseEnter = () => {
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
        setShowReactions(true);
    };

    const handleMouseLeave = () => {
        hideTimer.current = setTimeout(() => {
            setShowReactions(false);
        }, 150);
    };

    const handleTouchStart = () => {
        longPressTimer.current = setTimeout(() => setShowReactions(true), 400);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const handleReactionSelect = async (e: React.MouseEvent, reactionId: typeof reactions[number]['id']) => {
        e.stopPropagation();
        if (!currentUser) return;

        try {
            if (selectedReaction === reactionId) {
                onReactionChange?.(selectedReaction, null);
                setSelectedReaction(null);
                await toggleReaction(postId, currentUser.uid, reactionId);
            } else {
                onReactionChange?.(selectedReaction, reactionId);
                setSelectedReaction(reactionId);
                await toggleReaction(postId, currentUser.uid, reactionId);
            }
            setShowReactions(false);
        } catch (error) {
            console.error("Error toggling reaction:", error);
        }
    };

    const handleLikeClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) return;
        try {
            if (!selectedReaction) {
                onReactionChange?.(null, 'like');
                setSelectedReaction('like');
                await toggleReaction(postId, currentUser.uid, 'like');
            } else {
                onReactionChange?.(selectedReaction, null);
                setSelectedReaction(null);
                await toggleReaction(postId, currentUser.uid, selectedReaction);
            }
        } catch (error) {
            console.error("Error toggling reaction:", error);
        }
    };

    const handleSaveToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser || saveLoading) return;

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

    const activeReaction = reactions.find(r => r.id === selectedReaction);

    return (
        <div className="flex items-center justify-between pt-2">
            {/* Left side: Like + Comment */}
            <div className="flex items-center gap-1">
                {/* Reaction Button with popup */}
                <div
                    className="relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Invisible bridge to connect button to popup */}
                    {showReactions && (
                        <div className="absolute bottom-full left-0 w-full h-3" />
                    )}

                    {/* Reactions popup */}
                    <div
                        className={cn(
                            "absolute bottom-full left-0 mb-1 transition-all duration-200 origin-bottom-left z-20",
                            showReactions ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-90 invisible pointer-events-none'
                        )}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="flex gap-1 p-1.5 bg-popover rounded-full shadow-lg border border-border">
                            {reactions.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={(e) => handleReactionSelect(e, r.id)}
                                    className={cn(
                                        "w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-125 hover:bg-muted",
                                        selectedReaction === r.id && "bg-muted scale-110"
                                    )}
                                >
                                    <span className="text-xl">{r.emoji}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 h-9 px-3 text-sm font-normal text-muted-foreground"
                        onClick={handleLikeClick}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <span className="text-lg">{activeReaction?.emoji || '👍'}</span>
                        <span className="capitalize">{selectedReaction || 'Like'}</span>
                    </Button>
                </div>

                {/* Comment Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-9 px-3 text-sm font-normal text-muted-foreground"
                    onClick={(e) => { e.stopPropagation(); onCommentClick?.(); }}
                >
                    <MessageCircle className="w-5 h-5" />
                    <span>Comment</span>
                </Button>
            </div>

            {/* Right side: Save */}
            <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveToggle}
                disabled={saveLoading}
                className={cn(
                    "gap-1.5 h-9 px-3 text-sm font-normal",
                    isSaved ? "text-foreground" : "text-muted-foreground"
                )}
            >
                <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
            </Button>
        </div>
    );
}
