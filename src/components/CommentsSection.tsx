'use client';

import { useState, useEffect } from 'react';
import { Comment } from '@/types';
import { getComments, createComment } from '@/services/comments';
import { auth } from '@/lib/firebase';
import { User as UserIcon, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
        // Only fetch if no initial comments provided
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
                postId: postId,
                userId: currentUser.uid,
                userDisplayName: currentUser.displayName || 'Anonymous',
                userPhotoUrl: currentUser.photoURL || "",
                content: newComment.trim(),
            };

            const commentId = await createComment(commentData);

            // Optimistically update UI
            const newCommentObj: Comment = {
                ...commentData,
                commentId: commentId,
                createdAt: new Date().toISOString(),
                replies: []
            };

            setComments([...comments, newCommentObj]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
                <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments ({comments.length})</h2>

            {/* Comment List */}
            <div className="space-y-4 mb-6">
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.commentId} className="flex gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {comment.userPhotoUrl ? (
                                    <img src={comment.userPhotoUrl} alt={comment.userDisplayName} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm text-gray-900">{comment.userDisplayName}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-800 text-sm">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Form */}
            {currentUser ? (
                <form onSubmit={handleAddComment} className="flex gap-2 items-start">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {currentUser.photoURL ? (
                            <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 pr-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            disabled={submittingComment}
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submittingComment}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:bg-blue-50 rounded-full disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600 text-sm mb-2">Please login to leave a comment</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="text-blue-600 font-medium text-sm hover:underline"
                    >
                        Login now
                    </button>
                </div>
            )}
        </div>
    );
}
