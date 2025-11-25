'use client';

import { useEffect, useState, use } from 'react';
import { getPost } from '@/services/post';
import { getUser } from '@/services/user';
import { Post, User } from '@/types';
import BottomNav from '@/components/BottomNav';
import { ChevronLeft, ChevronRight, Star, User as UserIcon, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getComments, createComment } from '@/services/comments';
import { auth } from '@/lib/firebase';
import { Comment } from '@/types';

export default function PostPage({ params }: { params: Promise<{ userId: string; postId: string }> }) {
    const { userId, postId } = use(params);
    const [post, setPost] = useState<Post | null>(null);
    const [author, setAuthor] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const currentUser = auth.currentUser;
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedPost = await getPost(postId);
                setPost(fetchedPost);

                if (fetchedPost) {
                    const fetchedAuthor = await getUser(fetchedPost.authorId);
                    setAuthor(fetchedAuthor);

                    // Fetch comments
                    const fetchedComments = await getComments(postId);
                    setComments(fetchedComments);
                }
            } catch (error) {
                console.error('Error fetching post data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [postId]);

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

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser || !post) return;

        setSubmittingComment(true);
        try {
            const commentData = {
                post_id: post.id,
                user_id: currentUser.uid,
                user_display_name: currentUser.displayName || 'Anonymous',
                user_photo_url: currentUser.photoURL || undefined,
                content: newComment.trim(),
            };

            const commentId = await createComment(commentData);

            // Optimistically update UI
            const newCommentObj: Comment = {
                ...commentData,
                comment_id: commentId,
                created_at: new Date().toISOString(),
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Post not found.</p>
                    <button
                        onClick={() => router.push('/feed')}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Go to Feed
                    </button>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
                <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">Post</h1>
            </div>

            <main className="max-w-md mx-auto p-4">
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
                        <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => router.push(`/${post.authorId}`)}>
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
                </div>

                {/* Comments Section */}
                <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments ({comments.length})</h2>

                    {/* Comment List */}
                    <div className="space-y-4 mb-6">
                        {comments.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.comment_id} className="flex gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                                        {comment.user_photo_url ? (
                                            <img src={comment.user_photo_url} alt={comment.user_display_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm text-gray-900">{comment.user_display_name}</span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(comment.created_at).toLocaleDateString()}
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
            </main>

            <BottomNav />
        </div>
    );
}
