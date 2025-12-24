'use client';

import { Post } from '@/types';
import { Star, User as UserIcon, Trash2, MoreHorizontal, Edit2, MessageCircle } from 'lucide-react';
import { APP_CONFIG } from '@/config/settings';
import { getUser } from '@/services/user';
import { deletePost } from '@/services/post';
import { calculateTotalReactions, ReactionType } from '@/services/reaction';
import { auth } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostActions from './PostActions';
import CreatePostModal from './CreatePostModal';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface PostCardProps {
    post: Post;
    onDelete?: () => void;
    onClick?: () => void;
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
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    if (weeks < 4) return `${weeks}w`;
    if (months < 12) return `${months}mo`;
    return `${years}y`;
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

export default function PostCard({ post, onDelete, onClick }: PostCardProps) {
    const router = useRouter();
    const [authorName, setAuthorName] = useState<string>('');
    const [authorPhoto, setAuthorPhoto] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const currentUser = auth.currentUser;
    const isAuthor = currentUser?.uid === post.authorId;
    const [showEditModal, setShowEditModal] = useState(false);
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

    useEffect(() => {
        const fetchAuthor = async () => {
            try {
                const user = await getUser(post.authorId);
                setAuthorName(user?.displayName || 'Unknown');
                setAuthorPhoto(user?.photoURL || null);
            } catch {
                setAuthorName('Unknown');
            }
        };
        fetchAuthor();
    }, [post.authorId]);

    const handleDelete = async () => {
        if (!confirm('Delete this post?')) return;
        setIsDeleting(true);
        try {
            await deletePost(post.id);
            onDelete?.();
        } catch {
            alert('Failed to delete');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClick = () => onClick ? onClick() : router.push(`/${post.authorId}/${post.id}`);

    const avgRating = Object.values(post.ratings).reduce((a, b) => a + b, 0) / 3;

    return (
        <Card
            onClick={handleClick}
            className="mb-4 cursor-pointer group overflow-hidden transition-all duration-300 hover:shadow-lg active:scale-[0.99]"
        >
            {/* Header: Avatar + Name + Time + Menu */}
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={authorPhoto || undefined} />
                        <AvatarFallback>
                            <UserIcon className="w-5 h-5" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{authorName}</p>
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

                {isAuthor && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowEditModal(true); }} className="gap-2">
                                <Edit2 className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(); }} disabled={isDeleting} className="gap-2 text-destructive focus:text-destructive">
                                <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Image */}
            {post.images?.[0] && (
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    <img
                        src={post.images[0]}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {post.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full font-medium">
                            +{post.images.length - 1}
                        </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold">{avgRating.toFixed(1)}</span>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="px-4 pt-3 pb-2">
                <p className="text-sm leading-relaxed line-clamp-3 mb-3">{post.content}</p>

                {!post.images?.[0] && (
                    <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
                        {APP_CONFIG.ratingCategories.map((cat) => (
                            <div key={cat.id} className="flex items-center gap-1">
                                <span>{cat.label}</span>
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="font-medium text-foreground">{post.ratings[cat.id as keyof typeof post.ratings] || 0}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reactions & Comments summary */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground pb-2 border-b border-border/50">
                    <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-0.5">
                            {reactionsConfig.map((r) => {
                                const count = reactionCounts[r.id] || 0;
                                return count > 0 ? (
                                    <span key={r.id} className="text-sm">{r.emoji}</span>
                                ) : null;
                            })}
                        </div>
                        <span>{calculateTotalReactions(reactionCounts)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{commentCount} comments</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-3">
                <PostActions postId={post.id} onCommentClick={handleClick} onReactionChange={handleReactionChange} />
            </div>

            <CreatePostModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={() => { setShowEditModal(false); onDelete?.(); }} post={post} />
        </Card>
    );
}
