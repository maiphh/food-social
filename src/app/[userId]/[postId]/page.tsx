'use client';

import { useEffect, useState, use } from 'react';
import { getPost } from '@/services/post';
import { getUser } from '@/services/user';
import { Post, User } from '@/types';
import BottomNav from '@/components/BottomNav';
import PostDetail from '@/components/PostDetail';
import CommentsSection from '@/components/CommentsSection';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getComments } from '@/services/comments';
import { Comment } from '@/types';

export default function PostPage({ params }: { params: Promise<{ userId: string; postId: string }> }) {
    const { userId, postId } = use(params);
    const [post, setPost] = useState<Post | null>(null);
    const [author, setAuthor] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialComments, setInitialComments] = useState<Comment[]>([]);
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
                    setInitialComments(fetchedComments);
                }
            } catch (error) {
                console.error('Error fetching post data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [postId]);

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
                        onClick={() => router.push('/')}
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
                {/* Post Detail Component */}
                <PostDetail
                    post={post}
                    author={author}
                    onAuthorClick={() => router.push(`/${post.authorId}`)}
                    onCommentClick={() => {
                        // Scroll to comments section
                        const commentsSection = document.getElementById('comments-section');
                        if (commentsSection) {
                            commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }}
                />

                {/* Comments Section Component */}
                <div id="comments-section" className="mt-6">
                    <CommentsSection
                        postId={postId}
                        initialComments={initialComments}
                    />
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
