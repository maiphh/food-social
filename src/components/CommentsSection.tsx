'use client';

import { useState, useEffect } from 'react';
import { Comment } from '@/types';
import { getComments, createComment } from '@/services/comments';
import { auth } from '@/lib/firebase';
import { User as UserIcon, Send, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface CommentsSectionProps {
    postId: string;
    initialComments?: Comment[];
}

export default function CommentsSection({ postId, initialComments = [] }: CommentsSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [loading, setLoading] = useState(!initialComments.length);
    const currentUser = auth.currentUser;
    const router = useRouter();

    useEffect(() => {
        if (!initialComments.length) {
            const fetchComments = async () => {
                try {
                    const fetchedComments = await getComments(postId);
                    setComments(fetchedComments);
                } catch (error) {
                    console.error('Error fetching comments:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchComments();
        }
    }, [postId, initialComments.length]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        setSubmittingComment(true);
        try {
            const commentData = {
                postId,
                userId: currentUser.uid,
                userDisplayName: currentUser.displayName || 'Anonymous',
                userPhotoUrl: currentUser.photoURL || "",
                content: newComment.trim(),
            };

            const commentId = await createComment(commentData);

            setComments(prev => [...prev, {
                ...commentData,
                commentId,
                createdAt: new Date().toISOString(),
                replies: []
            }]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 flex justify-center">
                    <Spinner size="md" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">
                    Comments <span className="text-muted-foreground font-normal">({comments.length})</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
                {/* Comment Input */}
                {currentUser ? (
                    <form onSubmit={handleAddComment} className="flex gap-2 items-center">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={currentUser.photoURL || undefined} />
                            <AvatarFallback className="text-xs"><UserIcon className="w-3.5 h-3.5" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 relative">
                            <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="pr-10 h-9 text-sm"
                                disabled={submittingComment}
                            />
                            <Button
                                type="submit"
                                variant="ghost"
                                size="icon"
                                disabled={!newComment.trim() || submittingComment}
                                className="absolute right-0.5 top-1/2 -translate-y-1/2 h-8 w-8"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => router.push('/login')}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-muted/50 text-sm text-muted-foreground hover:bg-muted transition-colors"
                    >
                        Sign in to comment <ArrowRight className="w-4 h-4" />
                    </button>
                )}

                {/* Comments List */}
                {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No comments yet. Be the first!
                    </p>
                ) : (
                    <div className="space-y-3">
                        {comments.map((comment, index) => (
                            <div
                                key={comment.commentId}
                                className="flex gap-2 animate-in fade-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <Avatar className="h-7 w-7 flex-shrink-0">
                                    <AvatarImage src={comment.userPhotoUrl || undefined} />
                                    <AvatarFallback className="text-[10px]">
                                        <UserIcon className="w-3 h-3" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="bg-muted/50 rounded-xl px-3 py-2">
                                        <p className="text-xs font-medium">{comment.userDisplayName}</p>
                                        <p className="text-sm mt-0.5 break-words">{comment.content}</p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1 px-3">
                                        {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
