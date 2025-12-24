'use client';

import { useState, useEffect } from 'react';
import { Post, User } from '@/types';
import { ChevronLeft, ChevronRight, Star, User as UserIcon, MessageCircle, MapPin, DollarSign } from 'lucide-react';
import { APP_CONFIG } from '@/config/settings';
import PostActions from './PostActions';
import { calculateTotalReactions, ReactionType } from '@/services/reaction';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PostDetailProps {
    post: Post;
    author: User | null;
    onAuthorClick?: () => void;
    onCommentClick?: () => void;
}

function getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    return `${years} year${years > 1 ? 's' : ''} ago`;
}

function formatFullDate(timestamp: number): string {
    const date = new Date(timestamp);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[date.getDay()];
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${day}, ${dd}/${mm}/${yyyy} at ${hh}:${min}`;
}

export default function PostDetail({ post, author, onAuthorClick, onCommentClick }: PostDetailProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [reactionCounts, setReactionCounts] = useState<Record<string, number>>(post.reactionCount || {});
    const [commentCount, setCommentCount] = useState(post.commentCount || 0);

    useEffect(() => {
        setReactionCounts(post.reactionCount || {});
        setCommentCount(post.commentCount || 0);
    }, [post.reactionCount, post.commentCount]);

    const handleReactionChange = (oldReaction: ReactionType | null, newReaction: ReactionType | null) => {
        setReactionCounts(prev => {
            const newCounts = { ...prev };
            if (oldReaction) newCounts[oldReaction] = Math.max(0, (newCounts[oldReaction] || 0) - 1);
            if (newReaction) newCounts[newReaction] = (newCounts[newReaction] || 0) + 1;
            return newCounts;
        });
    };

    const reactionsConfig = APP_CONFIG.reactions;

    const nextImage = () => post.images && setCurrentImageIndex((prev) => (prev + 1) % post.images!.length);
    const prevImage = () => post.images && setCurrentImageIndex((prev) => (prev - 1 + post.images!.length) % post.images!.length);

    return (
        <Card className="overflow-hidden">
            {/* Author Header */}
            <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                <div
                    className={cn("flex items-center gap-3 flex-1", onAuthorClick && "cursor-pointer")}
                    onClick={onAuthorClick}
                >
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={author?.photoURL || undefined} />
                        <AvatarFallback><UserIcon className="w-5 h-5" /></AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">{author?.displayName || 'Unknown'}</p>
                        <div className="relative group/time">
                            <p className="text-xs text-muted-foreground cursor-default">
                                {getRelativeTime(post.createdAt)}
                            </p>
                            <div className="absolute left-0 bottom-full mb-1 hidden group-hover/time:block z-50">
                                <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg border border-border whitespace-nowrap">
                                    {formatFullDate(post.createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Carousel - Fixed 4:3 aspect ratio for consistency */}
            {post.images && post.images.length > 0 && (
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    <img
                        src={post.images[currentImageIndex]}
                        alt=""
                        className="w-full h-full object-cover"
                    />

                    {post.images.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-background/70 backdrop-blur-sm hover:bg-background/90"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 bg-background/70 backdrop-blur-sm hover:bg-background/90"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>

                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {post.images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-all",
                                            idx === currentImageIndex ? 'bg-white w-5' : 'bg-white/50'
                                        )}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="p-4 space-y-4">
                {/* Content */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                {/* Ratings */}
                <div className="grid grid-cols-3 gap-2">
                    {APP_CONFIG.ratingCategories.map((cat) => (
                        <div key={cat.id} className="flex flex-col items-center p-3 rounded-xl bg-muted/50">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{cat.label}</span>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="text-lg font-semibold">{post.ratings[cat.id as keyof typeof post.ratings] || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="flex flex-wrap gap-2 text-xs">
                    {post.address && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{post.address}</span>
                        </div>
                    )}
                    {(post.priceMin || post.priceMax) && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>{post.priceMin && post.priceMax ? `${post.priceMin}-${post.priceMax}` : post.priceMin || post.priceMax}</span>
                        </div>
                    )}
                    {post.recommendation && (
                        <div className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                            post.recommendation === 'highly-recommend' ? "bg-green-500/10 text-green-600" :
                                post.recommendation === 'recommend' ? "bg-blue-500/10 text-blue-600" :
                                    "bg-red-500/10 text-red-600"
                        )}>
                            {post.recommendation === 'not-recommend' ? '👎' : post.recommendation === 'highly-recommend' ? '🔥' : '👍'}
                            <span className="capitalize">{post.recommendation.replace('-', ' ')}</span>
                        </div>
                    )}
                </div>

                {/* Engagement Summary */}
                <div className="flex items-center gap-3 pt-3 border-t border-border text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-0.5">
                            {reactionsConfig.map((r) => {
                                const count = reactionCounts[r.id] || 0;
                                return count > 0 ? (
                                    <span key={r.id} className="text-sm">{r.emoji}</span>
                                ) : null;
                            })}
                        </div>
                        <span>{calculateTotalReactions(reactionCounts)} reactions</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{commentCount} comments</span>
                    </div>
                </div>

                {/* Actions */}
                <PostActions postId={post.id} onCommentClick={onCommentClick} onReactionChange={handleReactionChange} />
            </div>
        </Card>
    );
}
